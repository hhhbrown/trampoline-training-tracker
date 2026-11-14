export type CoachResource = {
    title: string;
    url: string;
    category: string;
    description?: string;
};

// Shared across coaches. Add approved competition documents and links here.
export const coachResources: CoachResource[] = [
    {
        title: "2025–2028 COP",
        url: "https://www.gymnastics.sport/publicdir/rules/files/en_1.1%20-%20TRA%20CoP%202025-2028.pdf",
        category: "Competition Rules & Pathways",
    },
    {
        title: "2027 Canadian Pathways",
        url: "https://activitymessenger-assets-ca.s3.ca-central-1.amazonaws.com/documents/661ccc8569271d9502e074bf3febbfcd/EN_TG_V5_Canadian.Pathways_2027.pdf",
        category: "Competition Rules & Pathways",
    },
    {
        title: "2026 Canadian Competition Rules",
        url: "https://activitymessenger-assets-ca.s3.ca-central-1.amazonaws.com/documents/a400d480d57b9dd557b70a1436f015df/TG_Canadian-Competition-Rules.pdf",
        category: "Competition Rules & Pathways",
    },
    {
        title: "2026 TRI National Team Selection",
        url: "https://activitymessenger-assets-ca.s3.ca-central-1.amazonaws.com/documents/16f9f15c30cc9963c1cc0ce06d9430b3/GYMCAN_2026-TG-National-Team-Selection-V2-EN-.pdf",
        category: "Selection Criteria",
    },
    {
        title: "2026 TRI WAGC Selection",
        url: "https://activitymessenger-assets-ca.s3.ca-central-1.amazonaws.com/documents/c44a8ed7145f76a2c441a708c1988566/GYMCAN_2026-TG-WAGC-Selection-Criteria-V2-EN.pdf",
        category: "Selection Criteria",
    },
    {
        title: "2026 DMT National Team Selection",
        url: "https://activitymessenger-assets-ca.s3.ca-central-1.amazonaws.com/documents/7dc19c33014d62bc19ccbce62e66cd4b/2026-TUM%26DMT-National-Team-Selection-EN.pdf",
        category: "Selection Criteria",
    },
    {
        title: "2026 DMT WAGC Selection",
        url: "https://activitymessenger-assets-ca.s3.ca-central-1.amazonaws.com/documents/7f41fdcb7e0e88d9f77db3d9f22052d5/2026-TUM-%26-DMT---WAGC-Selection-Process---EN.pdf",
        category: "Selection Criteria",
    },
    {
        title: "2026 DMT qualifying standards",
        url: "https://activitymessenger-assets-ca.s3.ca-central-1.amazonaws.com/documents/a578fab65ec4163987db7312fdd3bee1/2026-Qualifying-Standards---Updated-March-12.pdf",
        category: "Selection Criteria",
    },
    {
        title: "TRA Routine Bank",
        url: "https://docs.google.com/spreadsheets/d/1LX4YWoiZhLfT4XBrndcLmcI3Li8eEchwRdBcCGxW5UM/edit?usp=sharing",
        category: "Other Resources",
    },
    {
        title: "DMT Pass Bank",
        url: "https://docs.google.com/spreadsheets/d/1-XNuqQ81GezJikx1-_ip2mcHUlYBNczXj_idJu4MHMg/edit?usp=sharing",
        category: "Other Resources",
    },
    {
        title: "Other GYMCAN Resources",
        url: "https://activitymessenger.com/org/2366/page/RhZNlvr/trampoline-gymnastics",
        category: "Other Resources",
    },
];
