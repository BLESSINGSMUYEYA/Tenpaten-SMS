import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/HeadTeacherDashboard/Sidebar';
import { DashboardHeader } from '../components/DashboardHeader';
import { useQuery, useMutation } from '../hooks/useApi';
import { api } from '../services/api';

// ─── Step definitions ─────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Institutional Details', icon: 'domain',          description: 'School identity and contact information' },
  { id: 2, label: 'Academic Structure',    icon: 'school',          description: 'Terms, grades, and subject organization' },
  { id: 3, label: 'Financial Setup',       icon: 'account_balance', description: 'Fee structure and billing configuration' },
  { id: 4, label: "User Accounts",         icon: 'group_add',       description: 'Create administrator and staff accounts' },
  { id: 5, label: 'Final Review',          icon: 'task_alt',        description: 'Review and activate your institution' },
];

// ─── Form State ────────────────────────────────────────────────────────────────
interface SetupData {
  // Step 1
  schoolName: string;
  schoolCode: string;
  schoolType: string;
  motto: string;
  address: string;
  district: string;
  phone: string;
  email: string;
  website: string;
  // Step 2
  academicSystem: string;
  termsPerYear: string;
  grades: string[];
  subjects: string;
  yearStart: string;
  streams: string;
  // Step 3
  currencyCode: string;
  feeFrequency: string;
  primaryFee: string;
  secondaryFee: string;
  latePenalty: string;
  paymentMethods: string[];
  // Step 4
  accounts: { name: string; email: string; role: string }[];
}

const initialData: SetupData = {
  schoolName: '', schoolCode: '', schoolType: 'primary', motto: '',
  address: '', district: '', phone: '', email: '', website: '',
  academicSystem: 'term', termsPerYear: '3',
  grades: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'],
  subjects: 'Mathematics, English, Science, Social Studies, Chichewa',
  yearStart: '2026-01-01',
  streams: 'A, B',
  currencyCode: 'MWK', feeFrequency: 'termly',
  primaryFee: '', secondaryFee: '', latePenalty: '5',
  paymentMethods: ['cash'],
  accounts: [{ name: '', email: '', role: 'head_teacher' }],
};

// ─── Step stepper progress bar ─────────────────────────────────────────────────
const StepProgress: React.FC<{ current: number; completedSteps: Set<number> }> = ({ current, completedSteps }) => (
  <div className="relative">
    {/* Connection line */}
    <div className="absolute top-5 left-0 right-0 h-0.5 bg-outline-variant hidden sm:block" style={{ left: '10%', right: '10%' }}>
      <div
        className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-700 ease-out"
        style={{ width: `${Math.max(0, ((current - 1) / (STEPS.length - 1)) * 100)}%` }}
      />
    </div>

    <div className="flex items-start justify-between relative z-10">
      {STEPS.map(step => {
        const isCompleted = completedSteps.has(step.id);
        const isActive = step.id === current;
        const isPast = step.id < current;

        return (
          <div key={step.id} className="flex flex-col items-center gap-2 flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-sm ${
                isCompleted || isPast
                  ? 'bg-primary border-primary text-on-primary shadow-primary/25'
                  : isActive
                  ? 'bg-primary-container border-primary text-on-primary-container shadow-primary/20 scale-110'
                  : 'bg-surface-container-low border-outline-variant text-on-surface-variant'
              }`}
            >
              {isCompleted || isPast ? (
                <span className="material-symbols-outlined text-[18px]">check</span>
              ) : (
                <span className="material-symbols-outlined text-[18px]">{step.icon}</span>
              )}
            </div>
            <div className="text-center hidden md:block">
              <p className={`font-label-sm text-label-sm font-semibold leading-tight ${isActive ? 'text-primary' : isPast || isCompleted ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                {step.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

const DISTRICTS = [
  'Balaka', 'Blantyre', 'Chikwawa', 'Chiradzulu', 'Chitipa',
  'Dedza', 'Dowa', 'Karonga', 'Kasungu', 'Likoma',
  'Lilongwe', 'Machinga', 'Mangochi', 'Mchinji', 'Mulanje',
  'Mwanza', 'Mzimba', 'Neno', 'Nkhata Bay', 'Nkhotakota',
  'Nsanje', 'Ntcheu', 'Ntchisi', 'Phalombe', 'Rumphi',
  'Salima', 'Thyolo', 'Zomba',
];

// ─── Step 1: Institutional Details ────────────────────────────────────────────
const Step1: React.FC<{ data: SetupData; setData: React.Dispatch<React.SetStateAction<SetupData>> }> = ({ data, setData }) => {
  const set = (key: keyof SetupData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setData(prev => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Institutional Details</h2>
        <p className="font-body-md text-on-surface-variant mt-1">Enter your school's core identity and contact information.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* School Name */}
        <div className="md:col-span-2">
          <label className="font-label-md text-on-surface font-semibold block mb-1.5">
            School Name <span className="text-error">*</span>
          </label>
          <input
            className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 transition placeholder:text-on-surface-variant/50"
            placeholder="e.g. Miklosi Primary School"
            value={data.schoolName}
            onChange={set('schoolName')}
          />
        </div>

        {/* School Code */}
        <div>
          <label className="font-label-md text-on-surface font-semibold block mb-1.5">
            School Code <span className="text-error">*</span>
          </label>
          <input
            className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface font-body-md font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 transition placeholder:text-on-surface-variant/50"
            placeholder="e.g. MKL-001"
            value={data.schoolCode}
            onChange={set('schoolCode')}
          />
        </div>

        {/* School Type */}
        <div>
          <label className="font-label-md text-on-surface font-semibold block mb-1.5">School Type</label>
          <select
            className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
            value={data.schoolType}
            onChange={set('schoolType')}
          >
            <option value="primary">Primary School</option>
            <option value="secondary">Secondary School</option>
            <option value="combined">Combined (Primary + Secondary)</option>
            <option value="technical">Technical / Vocational</option>
          </select>
        </div>

        {/* Motto */}
        <div className="md:col-span-2">
          <label className="font-label-md text-on-surface font-semibold block mb-1.5">School Motto</label>
          <input
            className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 transition placeholder:text-on-surface-variant/50"
            placeholder="e.g. Knowledge is Power"
            value={data.motto}
            onChange={set('motto')}
          />
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label className="font-label-md text-on-surface font-semibold block mb-1.5">Physical Address</label>
          <textarea
            rows={2}
            className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 transition resize-none placeholder:text-on-surface-variant/50"
            placeholder="Street address, area..."
            value={data.address}
            onChange={set('address')}
          />
        </div>

        {/* District */}
        <div>
          <label className="font-label-md text-on-surface font-semibold block mb-1.5">District</label>
          <select
            className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
            value={data.district}
            onChange={set('district')}
          >
            <option value="">Select District...</option>
            {DISTRICTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Phone */}
        <div>
          <label className="font-label-md text-on-surface font-semibold block mb-1.5">Phone Number</label>
          <input
            type="tel"
            className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 transition placeholder:text-on-surface-variant/50"
            placeholder="+265 999 000 000"
            value={data.phone}
            onChange={set('phone')}
          />
        </div>

        {/* Email */}
        <div>
          <label className="font-label-md text-on-surface font-semibold block mb-1.5">School Email</label>
          <input
            type="email"
            className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 transition placeholder:text-on-surface-variant/50"
            placeholder="info@myschool.mw"
            value={data.email}
            onChange={set('email')}
          />
        </div>

        {/* Website */}
        <div>
          <label className="font-label-md text-on-surface font-semibold block mb-1.5">Website (optional)</label>
          <input
            type="url"
            className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 transition placeholder:text-on-surface-variant/50"
            placeholder="https://myschool.mw"
            value={data.website}
            onChange={set('website')}
          />
        </div>
      </div>
    </div>
  );
};

// ─── Step 2: Academic Structure ────────────────────────────────────────────────
const Step2: React.FC<{ data: SetupData; setData: React.Dispatch<React.SetStateAction<SetupData>> }> = ({ data, setData }) => {
  const set = (key: keyof SetupData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setData(prev => ({ ...prev, [key]: e.target.value }));

  const toggleGrade = (grade: string) => {
    setData(prev => ({
      ...prev,
      grades: prev.grades.includes(grade)
        ? prev.grades.filter(g => g !== grade)
        : [...prev.grades, grade],
    }));
  };

  const allGrades = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Form 1', 'Form 2', 'Form 3', 'Form 4'];

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Academic Structure</h2>
        <p className="font-body-md text-on-surface-variant mt-1">Set up how your school organizes its academic calendar and classes.</p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Academic system */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="font-label-md text-on-surface font-semibold block mb-1.5">Academic System</label>
            <select
              className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
              value={data.academicSystem}
              onChange={set('academicSystem')}
            >
              <option value="term">Term-based (3 terms/year)</option>
              <option value="semester">Semester-based (2 semesters)</option>
              <option value="quarter">Quarter-based (4 quarters)</option>
            </select>
          </div>
          <div>
            <label className="font-label-md text-on-surface font-semibold block mb-1.5">Academic Year Start</label>
            <input
              type="date"
              className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
              value={data.yearStart}
              onChange={set('yearStart')}
            />
          </div>
        </div>

        {/* Grades selection */}
        <div>
          <label className="font-label-md text-on-surface font-semibold block mb-2">
            Classes / Grades Offered
            <span className="ml-2 font-normal text-on-surface-variant">({data.grades.length} selected)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {allGrades.map(g => (
              <button
                key={g}
                type="button"
                onClick={() => toggleGrade(g)}
                className={`px-3.5 py-2 rounded-xl font-label-md font-semibold border transition-all ${
                  data.grades.includes(g)
                    ? 'bg-primary-container text-on-primary-container border-primary/30 shadow-sm'
                    : 'bg-surface-container-low text-on-surface-variant border-outline-variant hover:border-primary/30'
                }`}
              >
                {data.grades.includes(g) && <span className="material-symbols-outlined text-[14px] mr-1">check</span>}
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Streams/Divisions */}
        <div>
          <label className="font-label-md text-on-surface font-semibold block mb-1.5">
            Streams / Divisions (optional)
          </label>
          <input
            className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 transition placeholder:text-on-surface-variant/50"
            placeholder="e.g. A, B or North, East (leave blank if no streams)"
            value={data.streams}
            onChange={set('streams')}
          />
          <p className="font-body-sm text-on-surface-variant mt-1">
            If specified, each class/grade will be split into these streams (e.g. Form 1 A, Form 1 B).
          </p>
        </div>

        {/* Subjects */}
        <div>
          <label className="font-label-md text-on-surface font-semibold block mb-1.5">Subjects Offered</label>
          <p className="font-body-sm text-on-surface-variant mb-2">Select standard subjects to add or remove them, and type custom ones in the field below.</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {['Mathematics', 'English', 'Science', 'Social Studies', 'Chichewa', 'Biology', 'Chemistry', 'Physics', 'History', 'Geography', 'Agriculture', 'Computer Studies', 'Business Studies', 'Religious Education', 'Life Skills'].map(sub => {
              const selectedList = data.subjects.split(',').map(s => s.trim()).filter(Boolean);
              const isSelected = selectedList.includes(sub);
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => {
                    const list = data.subjects.split(',').map(s => s.trim()).filter(Boolean);
                    const hasSub = list.includes(sub);
                    const newList = hasSub ? list.filter(s => s !== sub) : [...list, sub];
                    setData(prev => ({ ...prev, subjects: newList.join(', ') }));
                  }}
                  className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm border transition-all ${
                    isSelected
                      ? 'bg-primary-container text-on-primary-container border-primary/30 font-bold shadow-sm'
                      : 'bg-surface-container-low text-on-surface-variant border-outline-variant hover:border-primary/30'
                  }`}
                >
                  {isSelected && <span className="material-symbols-outlined text-[12px] mr-1">check</span>}
                  {sub}
                </button>
              );
            })}
          </div>
          <textarea
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 transition resize-none placeholder:text-on-surface-variant/50"
            placeholder="Mathematics, English, Science, Social Studies..."
            value={data.subjects}
            onChange={set('subjects')}
          />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {data.subjects.split(',').filter(s => s.trim()).map((s, i) => (
              <span key={i} className="px-2.5 py-1 bg-secondary-container text-on-secondary-container rounded-full font-label-sm text-label-sm">
                {s.trim()}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Step 3: Financial Setup ───────────────────────────────────────────────────
const Step3: React.FC<{ data: SetupData; setData: React.Dispatch<React.SetStateAction<SetupData>> }> = ({ data, setData }) => {
  const set = (key: keyof SetupData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setData(prev => ({ ...prev, [key]: e.target.value }));

  const togglePayment = (method: string) => {
    setData(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(method)
        ? prev.paymentMethods.filter(m => m !== method)
        : [...prev.paymentMethods, method],
    }));
  };

  const paymentOptions = [
    { id: 'cash',         label: 'Cash',          icon: 'payments' },
    { id: 'bank',         label: 'Bank Transfer',  icon: 'account_balance' },
    { id: 'mobile_money', label: 'Mobile Money',   icon: 'smartphone' },
    { id: 'cheque',       label: 'Cheque',         icon: 'receipt_long' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Financial Setup</h2>
        <p className="font-body-md text-on-surface-variant mt-1">Configure fee structure and billing settings for your institution.</p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Currency & frequency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="font-label-md text-on-surface font-semibold block mb-1.5">Currency</label>
            <select
              className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
              value={data.currencyCode}
              onChange={set('currencyCode')}
            >
              <option value="MWK">MWK — Malawian Kwacha</option>
              <option value="USD">USD — US Dollar</option>
              <option value="ZAR">ZAR — South African Rand</option>
              <option value="ZMW">ZMW — Zambian Kwacha</option>
              <option value="TZS">TZS — Tanzanian Shilling</option>
            </select>
          </div>
          <div>
            <label className="font-label-md text-on-surface font-semibold block mb-1.5">Fee Collection Frequency</label>
            <select
              className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
              value={data.feeFrequency}
              onChange={set('feeFrequency')}
            >
              <option value="termly">Termly</option>
              <option value="monthly">Monthly</option>
              <option value="annually">Annually</option>
              <option value="semester">Per Semester</option>
            </select>
          </div>
        </div>

        {/* Fee amounts */}
        <div className="p-5 bg-surface-container-low border border-outline-variant rounded-xl">
          <h3 className="font-title-md font-semibold text-on-surface mb-4">Fee Amounts per Level</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-label-md text-on-surface font-semibold block mb-1.5">Primary Level Fee</label>
              <div className="flex">
                <span className="flex items-center px-3 bg-surface-container border border-r-0 border-outline-variant rounded-l-xl font-label-md text-on-surface-variant">
                  {data.currencyCode}
                </span>
                <input
                  type="number"
                  className="flex-1 px-4 py-3 rounded-r-xl border border-outline-variant bg-surface text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 transition placeholder:text-on-surface-variant/50"
                  placeholder="0.00"
                  value={data.primaryFee}
                  onChange={set('primaryFee')}
                />
              </div>
            </div>
            <div>
              <label className="font-label-md text-on-surface font-semibold block mb-1.5">Secondary Level Fee</label>
              <div className="flex">
                <span className="flex items-center px-3 bg-surface-container border border-r-0 border-outline-variant rounded-l-xl font-label-md text-on-surface-variant">
                  {data.currencyCode}
                </span>
                <input
                  type="number"
                  className="flex-1 px-4 py-3 rounded-r-xl border border-outline-variant bg-surface text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 transition placeholder:text-on-surface-variant/50"
                  placeholder="0.00"
                  value={data.secondaryFee}
                  onChange={set('secondaryFee')}
                />
              </div>
            </div>
            <div>
              <label className="font-label-md text-on-surface font-semibold block mb-1.5">Late Payment Penalty (%)</label>
              <input
                type="number"
                min="0" max="100"
                className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                placeholder="e.g. 5"
                value={data.latePenalty}
                onChange={set('latePenalty')}
              />
            </div>
          </div>
        </div>

        {/* Payment methods */}
        <div>
          <label className="font-label-md text-on-surface font-semibold block mb-3">
            Accepted Payment Methods
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {paymentOptions.map(pm => (
              <button
                key={pm.id}
                type="button"
                onClick={() => togglePayment(pm.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                  data.paymentMethods.includes(pm.id)
                    ? 'bg-primary-container/40 border-primary/40 text-on-primary-container shadow-sm'
                    : 'bg-surface-container-low border-outline-variant text-on-surface-variant hover:border-primary/20'
                }`}
              >
                <span className={`material-symbols-outlined text-[24px] ${data.paymentMethods.includes(pm.id) ? 'text-primary' : ''}`}>{pm.icon}</span>
                <span className="font-label-sm font-semibold text-center leading-tight">{pm.label}</span>
                {data.paymentMethods.includes(pm.id) && (
                  <span className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-primary text-[12px]">check</span>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Step 4: User Accounts ─────────────────────────────────────────────────────
const Step4: React.FC<{ data: SetupData; setData: React.Dispatch<React.SetStateAction<SetupData>> }> = ({ data, setData }) => {
  const addAccount = () =>
    setData(prev => ({ ...prev, accounts: [...prev.accounts, { name: '', email: '', role: 'teacher' }] }));

  const removeAccount = (idx: number) =>
    setData(prev => ({ ...prev, accounts: prev.accounts.filter((_, i) => i !== idx) }));

  const updateAccount = (idx: number, field: 'name' | 'email' | 'role', value: string) =>
    setData(prev => ({
      ...prev,
      accounts: prev.accounts.map((a, i) => i === idx ? { ...a, [field]: value } : a),
    }));

  const roleOptions = [
    { value: 'head_teacher',    label: 'Head Teacher' },
    { value: 'deputy_head',     label: 'Deputy Head' },
    { value: 'it_coordinator',  label: 'IT Coordinator' },
    { value: 'bursar',          label: 'Bursar' },
    { value: 'teacher',         label: 'Teacher' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">User Accounts</h2>
        <p className="font-body-md text-on-surface-variant mt-1">Create initial staff and administrator accounts. They'll receive login credentials by email.</p>
      </div>

      <div className="flex flex-col gap-4">
        {data.accounts.map((account, idx) => (
          <div
            key={idx}
            className="p-5 bg-surface-container-low border border-outline-variant rounded-xl relative group animate-fade-in"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[16px]">person</span>
                </div>
                <span className="font-label-md font-semibold text-on-surface">Account {idx + 1}</span>
              </div>
              {data.accounts.length > 1 && (
                <button
                  onClick={() => removeAccount(idx)}
                  className="p-1.5 rounded-lg text-error hover:bg-error-container/30 transition-colors opacity-0 group-hover:opacity-100"
                  title="Remove account"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="font-label-md text-on-surface font-semibold block mb-1.5">Full Name</label>
                <input
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 transition placeholder:text-on-surface-variant/50"
                  placeholder="e.g. Mr. James Phiri"
                  value={account.name}
                  onChange={e => updateAccount(idx, 'name', e.target.value)}
                />
              </div>
              <div className="sm:col-span-1">
                <label className="font-label-md text-on-surface font-semibold block mb-1.5">Email Address</label>
                <input
                  type="email"
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 transition placeholder:text-on-surface-variant/50"
                  placeholder="user@school.mw"
                  value={account.email}
                  onChange={e => updateAccount(idx, 'email', e.target.value)}
                />
              </div>
              <div>
                <label className="font-label-md text-on-surface font-semibold block mb-1.5">Role</label>
                <select
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                  value={account.role}
                  onChange={e => updateAccount(idx, 'role', e.target.value)}
                >
                  {roleOptions.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={addAccount}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-outline-variant text-on-surface-variant hover:border-primary/40 hover:text-primary hover:bg-primary-container/10 transition-all font-label-md font-semibold"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Add Another Account
        </button>

        <div className="p-4 bg-secondary-container/20 border border-secondary/20 rounded-xl flex items-start gap-3">
          <span className="material-symbols-outlined text-secondary text-[20px] shrink-0">info</span>
          <p className="font-body-sm text-on-surface-variant">
            Each account will receive a temporary password via email when you activate the setup. Users will be prompted to change their password on first login.
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── Step 5: Final Review ──────────────────────────────────────────────────────
const Step5: React.FC<{ data: SetupData; onActivate: () => void; isSaving: boolean }> = ({ data, onActivate, isSaving }) => {
  const sections = [
    {
      title: 'Institutional Details',
      icon: 'domain',
      items: [
        { label: 'Name',     value: data.schoolName || '—' },
        { label: 'Code',     value: data.schoolCode || '—' },
        { label: 'Type',     value: data.schoolType },
        { label: 'Motto',    value: data.motto || '—' },
        { label: 'District', value: data.district || '—' },
        { label: 'Email',    value: data.email || '—' },
      ],
    },
    {
      title: 'Academic Structure',
      icon: 'school',
      items: [
        { label: 'System',   value: data.academicSystem },
        { label: 'Grades',   value: data.grades.join(', ') || '—' },
        { label: 'Streams',  value: data.streams || 'None' },
        { label: 'Subjects', value: data.subjects || '—' },
        { label: 'Year Start', value: data.yearStart },
      ],
    },
    {
      title: 'Financial Setup',
      icon: 'account_balance',
      items: [
        { label: 'Currency',       value: data.currencyCode },
        { label: 'Frequency',      value: data.feeFrequency },
        { label: 'Primary Fee',    value: data.primaryFee ? `${data.currencyCode} ${data.primaryFee}` : '—' },
        { label: 'Secondary Fee',  value: data.secondaryFee ? `${data.currencyCode} ${data.secondaryFee}` : '—' },
        { label: 'Late Penalty',   value: `${data.latePenalty}%` },
        { label: 'Payment Methods',value: data.paymentMethods.join(', ') || '—' },
      ],
    },
    {
      title: 'User Accounts',
      icon: 'group_add',
      items: data.accounts.map((a, i) => ({
        label: `Account ${i + 1}`,
        value: a.name ? `${a.name} (${a.role.replace('_', ' ')}) · ${a.email}` : '—',
      })),
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Final Review</h2>
        <p className="font-body-md text-on-surface-variant mt-1">Review all your setup details before activating your institution.</p>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        {sections.map(sec => (
          <div key={sec.title} className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center gap-2 p-4 bg-surface-container-low border-b border-outline-variant">
              <span className="material-symbols-outlined text-primary text-[20px]">{sec.icon}</span>
              <h3 className="font-title-md font-semibold text-on-surface">{sec.title}</h3>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
              {sec.items.map(item => (
                <div key={item.label} className="flex gap-2 py-1.5 border-b border-outline-variant/40 last:border-b-0">
                  <span className="font-label-sm text-on-surface-variant min-w-[110px] shrink-0">{item.label}:</span>
                  <span className="font-label-sm text-on-surface font-medium break-words">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Activate button */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={onActivate}
          disabled={isSaving}
          className="flex items-center gap-3 bg-gradient-to-r from-primary to-primary-container text-on-primary px-8 py-4 rounded-2xl font-title-md font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:cursor-wait"
        >
          <span className="material-symbols-outlined">rocket_launch</span>
          {isSaving ? 'Saving & Activating...' : 'Activate Institution'}
        </button>
        <p className="font-body-sm text-on-surface-variant">
          This will apply your setup and activate all user accounts.
        </p>
      </div>
    </div>
  );
};

// ─── Success overlay ───────────────────────────────────────────────────────────
const SuccessOverlay: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
    <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-8 max-w-md w-full text-center shadow-2xl animate-slide-in-bottom">
      <div className="w-20 h-20 rounded-full bg-primary-container mx-auto flex items-center justify-center mb-5">
        <span className="material-symbols-outlined text-primary text-[48px]">check_circle</span>
      </div>
      <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-2">Institution Activated!</h2>
      <p className="font-body-md text-on-surface-variant mb-6">
        Your institution setup is complete. All staff accounts have been created and will receive their login credentials by email.
      </p>
      <button
        onClick={onClose}
        className="bg-primary text-on-primary px-6 py-3 rounded-xl font-label-md font-semibold hover:opacity-90 active:scale-95 transition-all"
      >
        Go to Dashboard
      </button>
    </div>
  </div>
);

// ─── Main Setup Page ───────────────────────────────────────────────────────────
export const SchoolSetupWizard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [data, setData] = useState<SetupData>(initialData);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  // Fetch existing school data
  const { data: schoolData } = useQuery<any>('/schools/my-school');
  const { mutate: updateSchool, loading: isSaving } = useMutation('/schools/my-school', 'put');

  useEffect(() => {
    if (schoolData) {
      setData(prev => ({
        ...prev,
        schoolName: schoolData.name || '',
        schoolCode: schoolData.schoolCode || '',
        schoolType: schoolData.type || 'primary',
        motto: schoolData.motto || '',
        address: schoolData.address || '',
        district: schoolData.district || '',
        phone: schoolData.phone || '',
        email: schoolData.email || '',
        website: schoolData.website || '',
      }));
    }
  }, [schoolData]);

  const goNext = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    setCurrentStep(s => Math.min(s + 1, STEPS.length));
  };

  const goBack = () => setCurrentStep(s => Math.max(s - 1, 1));

  const handleActivate = async () => {
    setIsActivating(true);
    try {
      // 1. Update school details
      await updateSchool({
        name: data.schoolName,
        schoolCode: data.schoolCode,
        type: data.schoolType,
        motto: data.motto,
        address: data.address,
        district: data.district,
        phone: data.phone,
        email: data.email,
        website: data.website
      });

      // 2. Create Academic Year
      const yearStart = new Date(data.yearStart);
      const startYear = yearStart.getFullYear();
      const endYear = startYear + 1;
      const yearName = `${startYear}/${endYear}`;
      const yearEndDate = new Date(yearStart);
      yearEndDate.setFullYear(yearEndDate.getFullYear() + 1);
      yearEndDate.setDate(yearEndDate.getDate() - 1);

      const yearRes = await api.post('/schools/academic-years', {
        name: yearName,
        startDate: yearStart.toISOString(),
        endDate: yearEndDate.toISOString(),
        isCurrent: true
      });
      
      const academicYearId = yearRes.data?.data?.id;
      if (!academicYearId) {
        throw new Error('Failed to retrieve Academic Year ID from response');
      }

      // 3. Create Terms
      const numTerms = parseInt(data.termsPerYear) || 3;
      const termsCreated = [];
      for (let i = 1; i <= numTerms; i++) {
        const tStartDate = new Date(yearStart);
        tStartDate.setMonth(tStartDate.getMonth() + Math.round((i - 1) * 12 / numTerms));
        const tEndDate = new Date(yearStart);
        tEndDate.setMonth(tEndDate.getMonth() + Math.round(i * 12 / numTerms));
        tEndDate.setDate(tEndDate.getDate() - 1);

        const termRes = await api.post('/schools/terms', {
          academicYearId,
          name: `Term ${i}`,
          startDate: tStartDate.toISOString(),
          endDate: tEndDate.toISOString(),
          isCurrent: i === 1
        });
        if (termRes.data?.data) {
          termsCreated.push(termRes.data.data);
        }
      }
      const currentTermId = termsCreated[0]?.id;

      // 4. Create Classes
      const classIdMap: Record<string, string[]> = {};
      const streamNames = data.streams.split(',').map(s => s.trim()).filter(Boolean);

      for (const gradeName of data.grades) {
        classIdMap[gradeName] = [];
        if (streamNames.length > 0) {
          for (const stream of streamNames) {
            const classRes = await api.post('/schools/classes', {
              name: gradeName,
              stream,
              academicYearId
            });
            if (classRes.data?.data?.id) {
              classIdMap[gradeName].push(classRes.data.data.id);
            }
          }
        } else {
          const classRes = await api.post('/schools/classes', {
            name: gradeName,
            academicYearId
          });
          if (classRes.data?.data?.id) {
            classIdMap[gradeName].push(classRes.data.data.id);
          }
        }
      }

      // 5. Create Subjects
      const subjectNames = data.subjects.split(',').map(s => s.trim()).filter(Boolean);
      const subjectIdMap: Record<string, string> = {};
      for (const subName of subjectNames) {
        const code = subName.slice(0, 3).toUpperCase();
        const subRes = await api.post('/schools/subjects', {
          name: subName,
          code,
          isCore: true,
          caMax: 30,
          examMax: 70
        });
        if (subRes.data?.data?.id) {
          subjectIdMap[subName] = subRes.data.data.id;
        }
      }

      // 6. Assign Subjects to Classes (ClassSubject)
      for (const gradeName of data.grades) {
        const classIds = classIdMap[gradeName] || [];
        for (const classId of classIds) {
          for (const subName of subjectNames) {
            const subjectId = subjectIdMap[subName];
            if (!subjectId) continue;
            await api.post('/schools/class-subjects', {
              classId,
              subjectId
            });
          }
        }
      }

      // 7. Create Fee Structures
      const primaryFeeVal = parseFloat(data.primaryFee) || 0;
      const secondaryFeeVal = parseFloat(data.secondaryFee) || 0;
      if (currentTermId) {
        for (const gradeName of data.grades) {
          const classIds = classIdMap[gradeName] || [];
          for (const classId of classIds) {
            const isSecondary = gradeName.toLowerCase().includes('form') || gradeName.toLowerCase().includes('grade 9') || gradeName.toLowerCase().includes('grade 10') || gradeName.toLowerCase().includes('grade 11') || gradeName.toLowerCase().includes('grade 12');
            const feeAmount = isSecondary ? secondaryFeeVal : primaryFeeVal;
            
            if (feeAmount > 0) {
              await api.post('/finance/structures', {
                classId,
                termId: currentTermId,
                tuitionFee: feeAmount,
                boardingFee: 0,
                otherFee: 0
              });
            }
          }
        }
      }

      // 8. Onboard Staff Accounts
      for (const acc of data.accounts) {
        if (!acc.name || !acc.email) continue;
        const nameParts = acc.name.trim().split(/\s+/);
        const firstName = nameParts[0] || 'Staff';
        const lastName = nameParts.slice(1).join(' ') || 'Member';
        
        await api.post('/people/staff', {
          firstName,
          lastName,
          email: acc.email,
          role: acc.role
        });
      }

      setCompletedSteps(new Set([1, 2, 3, 4, 5]));
      setShowSuccess(true);
    } catch (err: any) {
      console.error('Failed to complete school setup:', err);
      const errMsg = err.response?.data?.message || err.message || 'Unknown activation error';
      alert(`Failed to complete school setup: ${errMsg}`);
    } finally {
      setIsActivating(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1 data={data} setData={setData} />;
      case 2: return <Step2 data={data} setData={setData} />;
      case 3: return <Step3 data={data} setData={setData} />;
      case 4: return <Step4 data={data} setData={setData} />;
      case 5: return <Step5 data={data} onActivate={handleActivate} isSaving={isActivating || isSaving} />;
      default: return null;
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex font-sans">
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />

      {showSuccess && (
        <SuccessOverlay onClose={() => { setShowSuccess(false); window.location.href = '/dashboard'; }} />
      )}

      <div className="flex-1 flex flex-col lg:ml-72 w-full min-w-0">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 px-4 md:px-8 pt-20 pb-8 bg-surface-bright overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* Page header */}
            <div className="mb-8">
              <h1 className="dash-page-title mb-1">Institution Setup Wizard</h1>
              <p className="font-body-md text-on-surface-variant">
                Complete all 5 steps to configure your school and go live on MyKlasi.
              </p>
            </div>

            {/* Step progress */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 mb-6 shadow-sm">
              <StepProgress current={currentStep} completedSteps={completedSteps} />

              {/* Current step label (mobile) */}
              <div className="mt-4 text-center md:hidden">
                <p className="font-label-md text-primary font-semibold">{STEPS[currentStep - 1].label}</p>
                <p className="font-body-sm text-on-surface-variant">{STEPS[currentStep - 1].description}</p>
              </div>

              {/* Step counter */}
              <div className="mt-4 flex justify-center">
                <span className="font-label-sm text-on-surface-variant">
                  Step <span className="font-bold text-on-surface">{currentStep}</span> of {STEPS.length}
                </span>
              </div>
            </div>

            {/* Step content card */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
              {/* Step header bar */}
              <div className="px-6 py-4 bg-gradient-to-r from-primary-container/40 to-surface-container-low border-b border-outline-variant flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[20px]">{STEPS[currentStep - 1].icon}</span>
                </div>
                <div>
                  <h2 className="font-title-md font-semibold text-on-surface">{STEPS[currentStep - 1].label}</h2>
                  <p className="font-body-sm text-on-surface-variant">{STEPS[currentStep - 1].description}</p>
                </div>
              </div>

              {/* Form content */}
              <div className="p-6 md:p-8">
                {renderStep()}
              </div>

              {/* Navigation footer */}
              {currentStep < STEPS.length && (
                <div className="px-6 md:px-8 py-4 bg-surface-container-low border-t border-outline-variant flex items-center justify-between">
                  <button
                    onClick={goBack}
                    disabled={currentStep === 1}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-outline-variant text-on-surface-variant font-label-md font-semibold hover:bg-surface-container-high transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Back
                  </button>

                  <div className="flex items-center gap-2">
                    {STEPS.map((_, i) => (
                      <span
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all ${
                          i + 1 === currentStep ? 'bg-primary w-5' : completedSteps.has(i + 1) ? 'bg-primary/60' : 'bg-outline-variant'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={goNext}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-md font-semibold hover:opacity-90 active:scale-95 transition-all shadow-sm"
                  >
                    {currentStep === STEPS.length - 1 ? 'Review' : 'Next'}
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SchoolSetupWizard;
