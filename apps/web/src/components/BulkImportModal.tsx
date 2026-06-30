import React, { useState, useRef } from 'react';
import { parseCSV, downloadCSVTemplate } from '../services/csv';
import { api } from '../services/api';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  type: 'student' | 'staff';
  classesList?: Array<{ id: string; name?: string; displayName: string }>;
  showSuccessToast?: (msg: string) => void;
}

interface ValidationResult {
  rowIdx: number;
  isValid: boolean;
  errors: string[];
  data: any;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  type,
  classesList = [],
  showSuccessToast,
}) => {
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  
  // Results screen
  const [importResults, setImportResults] = useState<any[] | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // CSV Templates configuration
  const studentHeaders = [
    'FirstName',
    'LastName',
    'Gender',
    'DateOfBirth',
    'Class',
    'BoardingStatus',
    'GuardianName',
    'GuardianPhone',
    'GuardianEmail',
    'GuardianRelationship',
  ];
  const studentSample = [
    'Chisomo',
    'Banda',
    'Female',
    '2012-05-15',
    classesList[0]?.displayName || 'Form 1 Alpha',
    'day',
    'Moses Banda',
    '0888123456',
    'moses.banda@email.com',
    'parent',
  ];

  const staffHeaders = ['FirstName', 'LastName', 'Role', 'Email', 'Phone'];
  const staffSample = [
    'Chimwemwe',
    'Kavalo',
    'teacher',
    'chimwemwe.kavalo@school.com',
    '0999123456',
  ];

  const handleDownloadTemplate = () => {
    if (type === 'student') {
      downloadCSVTemplate('student_import_template.csv', studentHeaders, studentSample);
    } else {
      downloadCSVTemplate('staff_import_template.csv', staffHeaders, staffSample);
    }
  };

  // Maps row columns case-insensitively
  const mapRow = (row: Record<string, string>) => {
    const mapped: Record<string, any> = {};
    Object.entries(row).forEach(([key, val]) => {
      const cleanKey = key.trim().toLowerCase().replace(/[\s_-]/g, '');
      if (type === 'student') {
        if (cleanKey === 'firstname' || cleanKey === 'first') mapped.firstName = val;
        else if (cleanKey === 'lastname' || cleanKey === 'last') mapped.lastName = val;
        else if (cleanKey === 'gender' || cleanKey === 'sex') mapped.gender = val.toLowerCase();
        else if (cleanKey === 'dateofbirth' || cleanKey === 'dob' || cleanKey === 'birthdate') mapped.dateOfBirth = val;
        else if (cleanKey === 'class' || cleanKey === 'classname' || cleanKey === 'classid') mapped.classIdOrName = val;
        else if (cleanKey === 'boardingstatus' || cleanKey === 'boarding' || cleanKey === 'type') mapped.boardingStatus = val.toLowerCase();
        else if (cleanKey === 'guardianname' || cleanKey === 'guardianfullname' || cleanKey === 'parentname') mapped.guardianName = val;
        else if (cleanKey === 'guardianphone' || cleanKey === 'parentphone') mapped.guardianPhone = val;
        else if (cleanKey === 'guardianemail' || cleanKey === 'parentemail') mapped.guardianEmail = val;
        else if (cleanKey === 'guardianrelationship' || cleanKey === 'relationship') mapped.guardianRelationship = val;
      } else {
        if (cleanKey === 'firstname' || cleanKey === 'first') mapped.firstName = val;
        else if (cleanKey === 'lastname' || cleanKey === 'last') mapped.lastName = val;
        else if (cleanKey === 'role' || cleanKey === 'systemrole' || cleanKey === 'job') mapped.role = val.toLowerCase();
        else if (cleanKey === 'email' || cleanKey === 'staffemail') mapped.email = val;
        else if (cleanKey === 'phone' || cleanKey === 'phonenumber' || cleanKey === 'staffphone') mapped.phone = val;
      }
    });
    return mapped;
  };

  // Real-time client-side validation
  const validateRow = (mapped: any, index: number): ValidationResult => {
    const errors: string[] = [];
    if (type === 'student') {
      if (!mapped.firstName) errors.push('First Name is required');
      if (!mapped.lastName) errors.push('Last Name is required');
      if (!mapped.classIdOrName) {
        errors.push('Class name or ID is required');
      } else {
        const found = classesList.find(
          c =>
            c.id === mapped.classIdOrName ||
            c.name.toLowerCase() === mapped.classIdOrName.toLowerCase() ||
            c.displayName.toLowerCase() === mapped.classIdOrName.toLowerCase()
        );
        if (!found) {
          errors.push(`Class '${mapped.classIdOrName}' not found in school`);
        }
      }
      if (!mapped.guardianName) errors.push('Guardian Name is required');
      if (!mapped.guardianPhone) {
        errors.push('Guardian Phone is required');
      } else if (mapped.guardianPhone.replace(/\D/g, '').length < 9) {
        errors.push('Guardian Phone must be at least 9 digits');
      }
      if (mapped.guardianEmail && !/\S+@\S+\.\S+/.test(mapped.guardianEmail)) {
        errors.push('Guardian Email is invalid');
      }
    } else {
      if (!mapped.firstName) errors.push('First Name is required');
      if (!mapped.lastName) errors.push('Last Name is required');
      if (!mapped.role) {
        errors.push('Role is required');
      } else {
        const validRoles = ['teacher', 'bursar', 'deputy_head', 'head_teacher', 'director', 'school_director'];
        if (!validRoles.includes(mapped.role)) {
          errors.push(`Role '${mapped.role}' is invalid. Options: teacher, bursar, deputy_head`);
        }
      }
      if (mapped.email && !/\S+@\S+\.\S+/.test(mapped.email)) {
        errors.push('Email is invalid');
      }
    }

    return {
      rowIdx: index,
      isValid: errors.length === 0,
      errors,
      data: mapped,
    };
  };

  const processFileContent = (text: string) => {
    try {
      const rows = parseCSV(text);
      if (rows.length === 0) {
        setImportError('No valid rows found in CSV file.');
        return;
      }
      
      const results = rows.map((r, idx) => {
        const mapped = mapRow(r);
        return validateRow(mapped, idx + 1);
      });

      setParsedRows(rows);
      setValidationResults(results);
      setImportError(null);
    } catch (err: any) {
      console.error(err);
      setImportError('Failed to parse CSV file structure.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      processFileContent(event.target?.result as string);
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      processFileContent(event.target?.result as string);
    };
    reader.readAsText(file);
  };

  const handleUploadSubmit = async () => {
    const invalidRows = validationResults.filter(r => !r.isValid);
    if (invalidRows.length > 0) {
      setImportError(`Cannot import. Please resolve the ${invalidRows.length} validation errors first.`);
      return;
    }

    setImporting(true);
    setImportError(null);
    try {
      const payloadData = validationResults.map(r => r.data);
      const endpoint = type === 'student' ? '/people/students/bulk' : '/people/staff/bulk';
      const bodyKey = type === 'student' ? 'students' : 'staff';

      const response = await api.post(endpoint, { [bodyKey]: payloadData });
      
      // Save results
      setImportResults(response.data.data);
      if (showSuccessToast) {
        showSuccessToast(`Successfully imported ${payloadData.length} records!`);
      }
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setImportError(err.response?.data?.message || 'Failed to complete import transaction.');
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadCredentials = () => {
    if (!importResults) return;
    let headers: string[] = [];
    let rows: string[][] = [];

    if (type === 'student') {
      headers = [
        'AdmissionNumber',
        'FirstName',
        'LastName',
        'Class',
        'StudentUsername',
        'StudentPassword',
        'ParentUsername',
        'ParentPassword',
      ];
      rows = importResults.map(r => [
        r.admissionNumber,
        r.firstName,
        r.lastName,
        r.className,
        r.studentUsername,
        r.studentTempPassword,
        r.parentUsername,
        r.parentTempPassword || 'N/A',
      ]);
    } else {
      headers = ['FirstName', 'LastName', 'Role', 'Username', 'Password'];
      rows = importResults.map(r => [
        r.firstName,
        r.lastName,
        r.role,
        r.username,
        r.tempPassword,
      ]);
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${type}_import_credentials.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetAll = () => {
    setParsedRows([]);
    setValidationResults([]);
    setImportError(null);
    setImportResults(null);
  };

  const hasInvalidRows = validationResults.some(r => !r.isValid);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-4xl shadow-2xl p-6 flex flex-col max-h-[90vh] overflow-hidden animate-scale-in">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-outline-variant mb-4">
          <h2 className="font-bold text-primary text-lg flex items-center gap-2">
            <span className="material-symbols-outlined">upload_file</span>
            {type === 'student' ? 'Bulk Enroll Students' : 'Bulk Onboard Staff'}
          </h2>
          <button
            onClick={() => { resetAll(); onClose(); }}
            className="text-on-surface-variant hover:bg-surface-container rounded-full p-1.5 flex items-center justify-center"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-1">
          
          {importError && (
            <div className="p-3.5 bg-error-container border border-error/20 text-on-error-container text-xs rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <div>{importError}</div>
            </div>
          )}

          {/* SCREEN 1: Import Results Credentials Screen */}
          {importResults ? (
            <div className="space-y-4">
              <div className="bg-success-container/10 border border-success/20 p-4 rounded-xl text-center space-y-2">
                <span className="material-symbols-outlined text-4xl text-primary">check_circle</span>
                <h4 className="font-bold text-on-surface text-base">Bulk Onboarding Completed Successfully!</h4>
                <p className="text-xs text-on-surface-variant max-w-lg mx-auto">
                  All {importResults.length} profiles have been created. Please download or copy the temporary login details below immediately. This is the only time these passwords will be shown.
                </p>
                <div className="flex justify-center gap-2 pt-2">
                  <button
                    onClick={handleDownloadCredentials}
                    className="px-4 py-2 bg-primary text-on-primary rounded-lg font-bold text-xs flex items-center gap-1.5 hover:opacity-95 shadow"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    Download Credentials CSV
                  </button>
                </div>
              </div>

              {/* Table of Generated credentials */}
              <div className="border border-outline-variant rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-surface-container text-on-surface-variant uppercase font-bold text-[10px] border-b border-outline-variant">
                    {type === 'student' ? (
                      <tr>
                        <th className="p-3">Name</th>
                        <th className="p-3">Class</th>
                        <th className="p-3">Student Logins</th>
                        <th className="p-3">Parent Logins</th>
                      </tr>
                    ) : (
                      <tr>
                        <th className="p-3">Name</th>
                        <th className="p-3">Role</th>
                        <th className="p-3">Username</th>
                        <th className="p-3">Temporary Password</th>
                      </tr>
                    )}
                  </thead>
                  <tbody className="divide-y divide-outline-variant/60">
                    {importResults.map((r, idx) => (
                      <tr key={idx} className="hover:bg-surface-container-lowest/50">
                        {type === 'student' ? (
                          <>
                            <td className="p-3 font-semibold text-on-surface">{r.firstName} {r.lastName}</td>
                            <td className="p-3 text-on-surface-variant">{r.className}</td>
                            <td className="p-3 font-mono">
                              <span className="block text-[10px] text-outline">User: {r.studentUsername}</span>
                              <span className="block text-warning font-semibold">Pass: {r.studentTempPassword}</span>
                            </td>
                            <td className="p-3 font-mono">
                              <span className="block text-[10px] text-outline">User: {r.parentUsername}</span>
                              <span className="block text-warning font-semibold">Pass: {r.parentTempPassword || 'N/A'}</span>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-3 font-semibold text-on-surface">{r.firstName} {r.lastName}</td>
                            <td className="p-3 text-on-surface-variant capitalize">{r.role}</td>
                            <td className="p-3 font-mono">{r.username}</td>
                            <td className="p-3 font-mono font-semibold text-warning">{r.tempPassword}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : parsedRows.length === 0 ? (
            /* SCREEN 2: Upload Area */
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-surface-container p-4 rounded-xl border border-outline-variant/60">
                <div>
                  <h4 className="font-bold text-on-surface text-sm">Download Template CSV</h4>
                  <p className="text-xs text-on-surface-variant">Use our template to organize your import columns properly.</p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="px-4 py-2 border border-primary text-primary rounded-lg font-bold text-xs hover:bg-primary/5 flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  Template
                </button>
              </div>

              {/* Drag Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                  isDragOver
                    ? 'border-primary bg-primary/5 text-primary scale-[0.99]'
                    : 'border-outline-variant/80 hover:border-primary/60 text-outline'
                }`}
              >
                <span className="material-symbols-outlined text-5xl">cloud_upload</span>
                <div className="text-center">
                  <span className="font-bold text-on-surface text-sm block">Drag and drop your CSV file here</span>
                  <span className="text-xs text-on-surface-variant">or click to browse from files</span>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv"
                  className="hidden"
                />
              </div>
            </div>
          ) : (
            /* SCREEN 3: Validation & Preview */
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-on-surface-variant">
                  Parsed <span className="font-bold text-on-surface">{parsedRows.length}</span> rows from CSV file.
                </span>
                <button
                  onClick={resetAll}
                  className="text-xs font-bold text-error hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">clear</span>
                  Reset File
                </button>
              </div>

              {/* Preview table */}
              <div className="border border-outline-variant rounded-xl overflow-hidden max-h-[45vh] overflow-y-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-surface-container sticky top-0 text-on-surface-variant uppercase font-bold text-[10px] border-b border-outline-variant z-10">
                    <tr>
                      <th className="p-3 w-12 text-center">Row</th>
                      <th className="p-3">Validation</th>
                      {type === 'student' ? (
                        <>
                          <th className="p-3">Student Name</th>
                          <th className="p-3">Class</th>
                          <th className="p-3">Guardian Info</th>
                        </>
                      ) : (
                        <>
                          <th className="p-3">Staff Name</th>
                          <th className="p-3">Role</th>
                          <th className="p-3">Email/Phone</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/60">
                    {validationResults.map((r, idx) => (
                      <tr
                        key={idx}
                        className={`hover:bg-surface-container-lowest/50 ${
                          !r.isValid ? 'bg-error-container/10' : ''
                        }`}
                      >
                        <td className="p-3 font-semibold text-outline text-center">{r.rowIdx}</td>
                        <td className="p-3">
                          {r.isValid ? (
                            <span className="px-2 py-0.5 bg-success/15 text-success text-[10px] rounded font-semibold flex items-center gap-1 w-max">
                              <span className="material-symbols-outlined text-[10px]">check</span> Valid
                            </span>
                          ) : (
                            <div className="space-y-1">
                              {r.errors.map((e, eIdx) => (
                                <span
                                  key={eIdx}
                                  className="px-2 py-0.5 bg-error/15 text-error text-[10px] rounded font-semibold flex items-center gap-1 w-max"
                                  title={e}
                                >
                                  <span className="material-symbols-outlined text-[10px]">warning</span>
                                  {e}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        {type === 'student' ? (
                          <>
                            <td className="p-3">
                              <span className="font-semibold block text-on-surface">
                                {r.data.firstName || <span className="text-error font-normal italic">Missing</span>}{' '}
                                {r.data.lastName || <span className="text-error font-normal italic">Missing</span>}
                              </span>
                              <span className="block text-[10px] text-outline capitalize">Gender: {r.data.gender || 'male'}</span>
                            </td>
                            <td className="p-3">
                              <span className="font-semibold text-on-surface">
                                {r.data.classIdOrName || <span className="text-error font-normal italic">Missing</span>}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="font-semibold block text-on-surface">
                                {r.data.guardianName || <span className="text-error font-normal italic">Missing</span>} (
                                {r.data.guardianRelationship || 'parent'})
                              </span>
                              <span className="block text-[10px] text-on-surface-variant font-mono">
                                Phone: {r.data.guardianPhone || <span className="text-error font-normal italic">Missing</span>} |{' '}
                                Email: {r.data.guardianEmail || 'N/A'}
                              </span>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-3 font-semibold text-on-surface">
                              {r.data.firstName || <span className="text-error font-normal italic">Missing</span>}{' '}
                              {r.data.lastName || <span className="text-error font-normal italic">Missing</span>}
                            </td>
                            <td className="p-3 text-on-surface-variant capitalize font-semibold">
                              {r.data.role || <span className="text-error font-normal italic">Missing</span>}
                            </td>
                            <td className="p-3 text-on-surface-variant font-mono">
                              Email: {r.data.email || 'N/A'} <br />
                              Phone: {r.data.phone || 'N/A'}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
          {importResults ? (
            <button
              onClick={() => { resetAll(); onClose(); }}
              className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all text-xs"
            >
              Done
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => { resetAll(); onClose(); }}
                className="px-6 py-2.5 border border-outline text-on-surface-variant font-bold rounded-lg hover:bg-surface-container active:scale-95 transition-all text-xs"
              >
                Cancel
              </button>
              {parsedRows.length > 0 && (
                <button
                  type="button"
                  onClick={handleUploadSubmit}
                  disabled={importing || hasInvalidRows}
                  className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all text-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">cloud_sync</span>
                  {importing ? 'Importing...' : `Import ${parsedRows.length} Rows`}
                </button>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
};
