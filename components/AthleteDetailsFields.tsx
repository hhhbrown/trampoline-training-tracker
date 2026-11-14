"use client";

type AthleteDetailsFieldsProps = {
    dateOfBirth: string;
    onDateOfBirthChange: (value: string) => void;
    gender: string;
    onGenderChange: (value: string) => void;
};

export default function AthleteDetailsFields({
    dateOfBirth,
    onDateOfBirthChange,
    gender,
    onGenderChange,
}: AthleteDetailsFieldsProps) {
    const inputStyle = "w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-base text-black outline-none focus:ring-2 focus:border-red-700 focus:ring-red-700";

    return (
        <div className="grid gap-5 sm:grid-cols-2">
            <div>
                <label htmlFor="athlete-date-of-birth" className="mb-1 block text-sm font-semibold text-black">
                    Date of birth <span className="font-normal text-red-900">(optional)</span>
                </label>
                <input
                    id="athlete-date-of-birth"
                    type="date"
                    autoComplete="bday"
                    value={dateOfBirth}
                    onChange={(event) => onDateOfBirthChange(event.target.value)}
                    className={inputStyle}
                />
            </div>
            <div>
                <label htmlFor="athlete-gender" className="mb-1 block text-sm font-semibold text-black">
                    Gender <span className="font-normal text-red-900">(optional)</span>
                </label>
                <select
                    id="athlete-gender"
                    value={gender}
                    onChange={(event) => onGenderChange(event.target.value)}
                    className={inputStyle}
                >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
            </div>
        </div>
    );
}
