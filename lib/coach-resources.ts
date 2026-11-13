export type CoachResource = {
    title: string;
    url: string;
    category: string;
    description?: string;
};

// Shared across coaches. Add approved competition documents and links here.
export const coachResources: CoachResource[] = [
    {
        title: "Current COP",
        url: "https://www.gymnastics.sport/publicdir/rules/files/en_1.1%20-%20TRA%20CoP%202025-2028.pdf",
        category: "Competition Rules & Pathways",
        description: "2025–2028 Trampoline Gymnastics Code of Points",
    },
    {
        title: "Canadian Pathways",
        url: "https://activitymessenger-assets-ca.s3.ca-central-1.amazonaws.com/documents/661ccc8569271d9502e074bf3febbfcd/EN_TG_V5_Canadian.Pathways_2027.pdf",
        category: "Competition Rules & Pathways",
    },
    {
        title: "Canadian Competition Rules",
        url: "https://activitymessenger-assets-ca.s3.ca-central-1.amazonaws.com/documents/a400d480d57b9dd557b70a1436f015df/TG_Canadian-Competition-Rules.pdf",
        category: "Competition Rules & Pathways",
    },
    {
        title: "National Team Selection",
        url: "https://activitymessenger-assets-ca.s3.ca-central-1.amazonaws.com/documents/16f9f15c30cc9963c1cc0ce06d9430b3/GYMCAN_2026-TG-National-Team-Selection-V2-EN-.pdf",
        category: "Selection Criteria",
    },
    {
        title: "WAGC Selection",
        url: "https://activitymessenger-assets-ca.s3.ca-central-1.amazonaws.com/documents/c44a8ed7145f76a2c441a708c1988566/GYMCAN_2026-TG-WAGC-Selection-Criteria-V2-EN.pdf",
        category: "Selection Criteria",
    },
    {
        title: "Other GYMCAN Resources",
        url: "https://activitymessenger.com/org/2366/page/RhZNlvr/trampoline-gymnastics",
        category: "Other Resources",
    },
];
