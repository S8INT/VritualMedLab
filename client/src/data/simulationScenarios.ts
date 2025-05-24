import { getDemoImage } from './images';

export interface LabScenario {
  id: number;
  title: string;
  department: string;
  description: string;
  patientInfo: {
    age: number;
    gender: string;
    symptoms: string[];
    medicalHistory: string;
    currentMedications?: string[];
  };
  specimens: {
    type: string;
    collectionMethod: string;
    appearance: string;
    image?: string;
  }[];
  procedure: SimulationStep[];
  expectedResults: {
    findings: string;
    interpretation: string;
    clinicalRelevance: string;
  };
  educationalNotes: string[];
  references: string[];
}

export interface SimulationStep {
  id: number;
  name: string;
  description: string;
  image: string;
  tools: Array<{
    id: number;
    name: string;
    icon: string;
  }>;
  targets: Array<{
    id: number;
    position: { x: number; y: number };
    size: { width: number; height: number };
  }>;
  feedback: {
    success: string;
    error: string;
  };
  detailedInstructions?: string[];
  scientificPrinciple?: string;
  safetyNotes?: string[];
  commonErrors?: string[];
}

// Real-world clinical scenarios for lab simulations
export const labScenarios: LabScenario[] = [
  {
    id: 1,
    title: "Bacterial Culture & Identification - Suspected UTI",
    department: "microbiology",
    description: "Identify bacterial pathogens in a urine sample from a patient with suspected urinary tract infection.",
    patientInfo: {
      age: 42,
      gender: "Female",
      symptoms: ["Dysuria", "Frequency", "Suprapubic pain", "Low-grade fever"],
      medicalHistory: "History of recurrent UTIs, no other significant medical history",
      currentMedications: ["Oral contraceptives"]
    },
    specimens: [
      {
        type: "Urine",
        collectionMethod: "Clean-catch midstream",
        appearance: "Cloudy, yellow with visible sediment",
        image: getDemoImage('specimens', 0)
      }
    ],
    procedure: [
      {
        id: 1,
        name: "Specimen Processing",
        description: "Prepare the urine sample for culture by proper handling and centrifugation if necessary.",
        image: getDemoImage('microbiology', 0),
        tools: [
          { id: 1, name: "Centrifuge", icon: "cycle" },
          { id: 2, name: "Pipette", icon: "colorize" }
        ],
        targets: [
          { id: 1, position: { x: 15, y: 40 }, size: { width: 25, height: 25 } },
          { id: 2, position: { x: 60, y: 45 }, size: { width: 20, height: 20 } }
        ],
        feedback: {
          success: "Sample processed correctly for culture!",
          error: "Improper sample handling can affect culture results."
        },
        detailedInstructions: [
          "Mix urine sample gently to ensure homogeneity",
          "Transfer 10mL to sterile centrifuge tube",
          "Centrifuge at 3000 rpm for 5 minutes",
          "Decant supernatant leaving 0.5mL of sediment",
          "Resuspend sediment by gentle pipetting"
        ],
        safetyNotes: [
          "Handle all specimens as potentially infectious",
          "Use PPE: gloves, lab coat, and eye protection"
        ],
        commonErrors: [
          "Insufficient centrifugation time leading to inadequate sedimentation",
          "Excessive vortexing causing cellular damage"
        ]
      },
      {
        id: 2,
        name: "Inoculation on Culture Media",
        description: "Streak the urine sample onto appropriate culture media for isolation of urinary pathogens.",
        image: getDemoImage('equipment', 1),
        tools: [
          { id: 1, name: "Inoculation Loop", icon: "gesture" },
          { id: 2, name: "CLED Agar Plate", icon: "science" },
          { id: 3, name: "Blood Agar Plate", icon: "science" }
        ],
        targets: [
          { id: 1, position: { x: 30, y: 35 }, size: { width: 20, height: 20 } },
          { id: 2, position: { x: 70, y: 40 }, size: { width: 20, height: 20 } }
        ],
        feedback: {
          success: "Media successfully inoculated using proper streaking technique!",
          error: "Improper streaking technique can prevent isolation of individual colonies."
        },
        scientificPrinciple: "The streak plate method allows separation of individual bacterial cells on the agar surface, which then multiply to form distinct, isolated colonies that can be identified.",
        detailedInstructions: [
          "Flame sterilize the inoculation loop until red hot",
          "Allow loop to cool for 5-10 seconds",
          "Collect a small amount of urine sample",
          "Streak in four quadrants on the CLED agar plate using the quadrant streaking technique",
          "Repeat the process for the blood agar plate",
          "Label plates with patient ID, date, and media type"
        ]
      },
      {
        id: 3,
        name: "Incubation",
        description: "Incubate the streaked plates under appropriate conditions for optimal bacterial growth.",
        image: getDemoImage('equipment', 2),
        tools: [
          { id: 1, name: "Incubator", icon: "thermostat" }
        ],
        targets: [
          { id: 1, position: { x: 45, y: 40 }, size: { width: 30, height: 30 } }
        ],
        feedback: {
          success: "Plates properly placed in incubator with correct settings!",
          error: "Incorrect incubation temperature or time can affect bacterial growth."
        },
        detailedInstructions: [
          "Set incubator to 35-37°C",
          "Place plates inverted (agar side up) in the incubator",
          "Incubate for 18-24 hours",
          "Record incubation start time and date"
        ]
      },
      {
        id: 4,
        name: "Colony Examination and Counting",
        description: "Examine the culture plates for bacterial growth and count colonies to determine infection severity.",
        image: getDemoImage('slides', 1),
        tools: [
          { id: 1, name: "Colony Counter", icon: "calculate" },
          { id: 2, name: "Magnifying Glass", icon: "search" }
        ],
        targets: [
          { id: 1, position: { x: 40, y: 45 }, size: { width: 25, height: 25 } }
        ],
        feedback: {
          success: "Colonies correctly examined and counted!",
          error: "Inaccurate colony counting can lead to misinterpretation of infection severity."
        },
        detailedInstructions: [
          "Observe colony morphology: size, shape, color, and hemolysis (on blood agar)",
          "Count colonies on CLED agar to determine CFU/mL",
          "Record any significant findings such as lactose fermentation (yellow colonies on CLED)"
        ],
        scientificPrinciple: "Colony counting provides a quantitative measure of bacterial load. In UTIs, >10^5 CFU/mL is typically considered significant for most pathogens, while lower counts may be significant in symptomatic patients or for certain pathogens."
      },
      {
        id: 5,
        name: "Gram Staining",
        description: "Perform Gram stain on isolated colonies to classify bacteria and guide further identification.",
        image: getDemoImage('slides', 0),
        tools: [
          { id: 1, name: "Microscope Slide", icon: "crop_landscape" },
          { id: 2, name: "Bunsen Burner", icon: "local_fire_department" },
          { id: 3, name: "Gram Stain Kit", icon: "palette" }
        ],
        targets: [
          { id: 1, position: { x: 20, y: 30 }, size: { width: 20, height: 15 } },
          { id: 2, position: { x: 50, y: 40 }, size: { width: 15, height: 20 } },
          { id: 3, position: { x: 75, y: 35 }, size: { width: 15, height: 15 } }
        ],
        feedback: {
          success: "Gram stain performed correctly!",
          error: "Improper staining technique can lead to misclassification of bacteria."
        },
        detailedInstructions: [
          "Place a drop of water on a clean microscope slide",
          "Transfer a small amount of bacterial colony to the water drop",
          "Spread to create a thin smear and allow to air dry",
          "Heat fix the smear by passing through flame 2-3 times",
          "Flood slide with crystal violet for 1 minute, then rinse with water",
          "Apply Gram's iodine for 1 minute, then rinse",
          "Decolorize with alcohol/acetone for 5-10 seconds, then rinse immediately",
          "Counterstain with safranin for 1 minute, then rinse",
          "Blot dry with bibulous paper"
        ],
        scientificPrinciple: "Gram staining differentiates bacteria based on cell wall composition. Gram-positive bacteria retain crystal violet (appear purple) due to thick peptidoglycan layer, while Gram-negative bacteria lose crystal violet during decolorization and appear pink from counterstain."
      },
      {
        id: 6,
        name: "Biochemical Testing",
        description: "Perform biochemical tests to identify the bacterial species based on metabolic capabilities.",
        image: getDemoImage('equipment', 3),
        tools: [
          { id: 1, name: "Oxidase Test", icon: "science" },
          { id: 2, name: "Catalase Test", icon: "science" },
          { id: 3, name: "API 20E Kit", icon: "view_module" }
        ],
        targets: [
          { id: 1, position: { x: 25, y: 40 }, size: { width: 15, height: 15 } },
          { id: 2, position: { x: 50, y: 40 }, size: { width: 15, height: 15 } },
          { id: 3, position: { x: 75, y: 40 }, size: { width: 15, height: 15 } }
        ],
        feedback: {
          success: "Biochemical tests correctly performed and interpreted!",
          error: "Inaccurate biochemical testing can lead to misidentification of pathogens."
        },
        detailedInstructions: [
          "For oxidase test: Apply a drop of oxidase reagent to filter paper and smear a portion of colony on it. Purple color within 10 seconds indicates positive result.",
          "For catalase test: Place a drop of 3% hydrogen peroxide on a slide and add a small amount of colony. Bubbling indicates positive result.",
          "For API 20E: Prepare bacterial suspension and inoculate each cupule following manufacturer's instructions, incubate, and interpret results using the identification software or manual."
        ]
      }
    ],
    expectedResults: {
      findings: "Gram-negative rods, lactose-fermenting colonies on CLED agar (yellow), >10^5 CFU/mL, oxidase negative, catalase positive. API 20E profile consistent with Escherichia coli.",
      interpretation: "Significant bacteriuria with E. coli, the most common causative agent of UTIs.",
      clinicalRelevance: "Findings support the clinical diagnosis of UTI. Antibiotic susceptibility testing should be performed to guide appropriate antimicrobial therapy."
    },
    educationalNotes: [
      "E. coli causes 80-90% of community-acquired UTIs",
      "Proper specimen collection is crucial to avoid contamination with perineal flora",
      "Colony count interpretation should consider patient symptoms and history",
      "Lower colony counts may be significant in patients on antibiotics or with certain symptoms"
    ],
    references: [
      "Clinical Microbiology Procedures Handbook, 4th Edition, ASM Press",
      "Manual of Clinical Microbiology, 12th Edition, ASM Press",
      "European Urinalysis Guidelines, European Confederation of Laboratory Medicine"
    ]
  },
  {
    id: 2,
    title: "Blood Glucose Analysis - Diabetes Monitoring",
    department: "clinical-chemistry",
    description: "Analyze blood glucose levels in a patient with suspected diabetes mellitus using the glucose oxidase method.",
    patientInfo: {
      age: 58,
      gender: "Male",
      symptoms: ["Polyuria", "Polydipsia", "Unexplained weight loss", "Fatigue"],
      medicalHistory: "Family history of type 2 diabetes, hypertension for 10 years",
      currentMedications: ["Lisinopril 10mg daily", "Aspirin 81mg daily"]
    },
    specimens: [
      {
        type: "Venous blood",
        collectionMethod: "Fasting venipuncture in fluoride oxalate tube",
        appearance: "Clear, straw-colored serum after centrifugation",
        image: getDemoImage('specimens', 1)
      }
    ],
    procedure: [
      {
        id: 1,
        name: "Sample Preparation",
        description: "Prepare the blood sample for glucose analysis by centrifugation and serum separation.",
        image: getDemoImage('clinicalChemistry', 0),
        tools: [
          { id: 1, name: "Centrifuge", icon: "cycle" },
          { id: 2, name: "Pipette", icon: "colorize" },
          { id: 3, name: "Test Tubes", icon: "science" }
        ],
        targets: [
          { id: 1, position: { x: 20, y: 40 }, size: { width: 25, height: 25 } },
          { id: 2, position: { x: 60, y: 45 }, size: { width: 20, height: 20 } }
        ],
        feedback: {
          success: "Blood sample correctly processed for glucose analysis!",
          error: "Improper sample processing can affect glucose measurement accuracy."
        },
        detailedInstructions: [
          "Ensure the blood collection tube is properly labeled and contains fluoride oxalate (glycolysis inhibitor)",
          "Allow blood to clot for 20-30 minutes at room temperature",
          "Centrifuge the sample at 3000 rpm for 10 minutes",
          "Carefully pipette the serum/plasma into a clean labeled tube",
          "Avoid hemolysis as it can interfere with certain glucose assay methods"
        ],
        safetyNotes: [
          "Handle all blood specimens as potentially infectious",
          "Use appropriate PPE: gloves, lab coat, and eye protection",
          "Follow proper sharps disposal protocols"
        ]
      },
      {
        id: 2,
        name: "Reagent Preparation",
        description: "Prepare glucose oxidase reagent according to the manufacturer's instructions.",
        image: getDemoImage('clinicalChemistry', 1),
        tools: [
          { id: 1, name: "Volumetric Flask", icon: "science" },
          { id: 2, name: "Analytical Balance", icon: "scale" },
          { id: 3, name: "Glucose Oxidase Kit", icon: "inventory_2" }
        ],
        targets: [
          { id: 1, position: { x: 30, y: 35 }, size: { width: 20, height: 20 } },
          { id: 2, position: { x: 70, y: 40 }, size: { width: 20, height: 20 } }
        ],
        feedback: {
          success: "Glucose oxidase reagent prepared correctly!",
          error: "Improper reagent preparation can lead to inaccurate glucose measurements."
        },
        scientificPrinciple: "The glucose oxidase method specifically measures glucose through an enzymatic reaction that produces hydrogen peroxide, which reacts with a chromogen to produce a colored compound proportional to glucose concentration.",
        detailedInstructions: [
          "Reconstitute lyophilized glucose oxidase reagent with exact volume of buffer specified",
          "Mix gently by inversion until completely dissolved",
          "Allow reagent to reach room temperature before use",
          "Check expiration date and storage conditions",
          "Prepare working reagent if required by manufacturer's instructions"
        ]
      },
      {
        id: 3,
        name: "Standard Curve Preparation",
        description: "Prepare a series of glucose standards to create a calibration curve.",
        image: getDemoImage('clinicalChemistry', 2),
        tools: [
          { id: 1, name: "Micropipettes", icon: "colorize" },
          { id: 2, name: "Standard Solution", icon: "opacity" },
          { id: 3, name: "Test Tubes", icon: "science" }
        ],
        targets: [
          { id: 1, position: { x: 20, y: 40 }, size: { width: 15, height: 20 } },
          { id: 2, position: { x: 45, y: 40 }, size: { width: 15, height: 20 } },
          { id: 3, position: { x: 70, y: 40 }, size: { width: 15, height: 20 } }
        ],
        feedback: {
          success: "Standard curve successfully prepared!",
          error: "Inaccurate standard preparation affects the reliability of results."
        },
        detailedInstructions: [
          "Label 5 test tubes for standards: 0, 50, 100, 200, and 300 mg/dL",
          "Using stock glucose standard (400 mg/dL), prepare dilutions:",
          "- Standard 0: 1mL distilled water (blank)",
          "- Standard 50: 0.125mL stock + 0.875mL distilled water",
          "- Standard 100: 0.25mL stock + 0.75mL distilled water",
          "- Standard 200: 0.5mL stock + 0.5mL distilled water",
          "- Standard 300: 0.75mL stock + 0.25mL distilled water",
          "Mix each standard thoroughly"
        ]
      },
      {
        id: 4,
        name: "Sample and Reagent Addition",
        description: "Add sample and reagents to reaction vessels following the assay protocol.",
        image: getDemoImage('clinicalChemistry', 3),
        tools: [
          { id: 1, name: "Micropipettes", icon: "colorize" },
          { id: 2, name: "Reaction Cuvettes", icon: "view_in_ar" },
          { id: 3, name: "Timer", icon: "timer" }
        ],
        targets: [
          { id: 1, position: { x: 30, y: 40 }, size: { width: 20, height: 20 } },
          { id: 2, position: { x: 60, y: 45 }, size: { width: 20, height: 20 } }
        ],
        feedback: {
          success: "Sample and reagents added in correct proportions and sequence!",
          error: "Improper reagent addition can cause inaccurate results."
        },
        detailedInstructions: [
          "Label reaction cuvettes for standards, controls, and patient samples",
          "Pipette 10μL of standard, control, or patient sample into appropriate cuvettes",
          "Add 1.0mL of glucose oxidase reagent to each cuvette",
          "Gently mix by tapping or using a vortex mixer",
          "Start timer immediately after adding reagent to first tube",
          "Maintain consistent timing between tubes"
        ]
      },
      {
        id: 5,
        name: "Incubation",
        description: "Incubate the reaction mixture at the appropriate temperature and time for the enzyme reaction.",
        image: getDemoImage('clinicalChemistry', 0),
        tools: [
          { id: 1, name: "Water Bath", icon: "hot_tub" },
          { id: 2, name: "Timer", icon: "timer" }
        ],
        targets: [
          { id: 1, position: { x: 40, y: 40 }, size: { width: 30, height: 30 } }
        ],
        feedback: {
          success: "Samples properly incubated at correct temperature and time!",
          error: "Incorrect incubation conditions can affect enzyme activity and result accuracy."
        },
        detailedInstructions: [
          "Set water bath to 37°C and verify temperature with thermometer",
          "Place all reaction cuvettes in water bath",
          "Incubate for exactly 10 minutes",
          "Ensure water level is sufficient to immerse reaction mixture portion of cuvettes"
        ],
        scientificPrinciple: "The glucose oxidase reaction is temperature-dependent. Precise temperature control is essential for accurate and reproducible results as enzyme kinetics vary with temperature."
      },
      {
        id: 6,
        name: "Absorbance Measurement",
        description: "Measure the absorbance of standards and samples using a spectrophotometer.",
        image: getDemoImage('equipment', 3),
        tools: [
          { id: 1, name: "Spectrophotometer", icon: "view_in_ar" },
          { id: 2, name: "Cuvettes", icon: "view_in_ar" },
          { id: 3, name: "Lint-free Wipes", icon: "cleaning_services" }
        ],
        targets: [
          { id: 1, position: { x: 40, y: 45 }, size: { width: 30, height: 25 } }
        ],
        feedback: {
          success: "Absorbance correctly measured at the appropriate wavelength!",
          error: "Inaccurate absorbance measurement will affect result calculation."
        },
        detailedInstructions: [
          "Turn on spectrophotometer and allow to warm up for 15 minutes",
          "Set wavelength to 505nm (or as specified in method)",
          "Zero instrument with blank (Standard 0)",
          "Wipe each cuvette with lint-free tissue before placing in instrument",
          "Measure and record absorbance of all standards, controls, and samples",
          "Measure in order from lowest to highest expected concentration"
        ]
      },
      {
        id: 7,
        name: "Calculation and Result Interpretation",
        description: "Calculate glucose concentration using the standard curve and interpret the results.",
        image: getDemoImage('clinicalChemistry', 3),
        tools: [
          { id: 1, name: "Calculator", icon: "calculate" },
          { id: 2, name: "Graph Paper", icon: "stacked_line_chart" },
          { id: 3, name: "Computer Software", icon: "computer" }
        ],
        targets: [
          { id: 1, position: { x: 40, y: 40 }, size: { width: 30, height: 30 } }
        ],
        feedback: {
          success: "Glucose concentration correctly calculated and interpreted!",
          error: "Calculation errors can lead to misdiagnosis and improper patient management."
        },
        detailedInstructions: [
          "Plot absorbance (y-axis) versus glucose concentration (x-axis) for standards",
          "Create best-fit line or curve through points",
          "Calculate glucose concentration of patient sample using the standard curve equation",
          "Apply any necessary dilution factors",
          "Compare result with reference ranges: Fasting plasma glucose 70-99 mg/dL (normal), 100-125 mg/dL (prediabetes), ≥126 mg/dL (diabetes)"
        ],
        scientificPrinciple: "Beer-Lambert Law states that absorbance is directly proportional to concentration, allowing quantification of glucose from measured absorbance values."
      }
    ],
    expectedResults: {
      findings: "Fasting plasma glucose: 186 mg/dL",
      interpretation: "Elevated fasting plasma glucose level (>126 mg/dL) consistent with diabetes mellitus. Repeat testing is recommended to confirm the diagnosis.",
      clinicalRelevance: "The result supports the clinical suspicion of diabetes mellitus. Further testing, such as HbA1c and OGTT, may be indicated to establish the diagnosis and monitor treatment."
    },
    educationalNotes: [
      "Fasting glucose ≥126 mg/dL on two separate occasions is diagnostic for diabetes",
      "Glucose oxidase method is specific for glucose and not affected by other reducing substances",
      "Proper sample handling is crucial as glycolysis can reduce glucose levels by 5-7% per hour in unpreserved samples",
      "Hemolysis can affect glucose measurements due to release of intracellular components"
    ],
    references: [
      "American Diabetes Association. Classification and Diagnosis of Diabetes: Standards of Medical Care in Diabetes. Diabetes Care.",
      "Tietz Textbook of Clinical Chemistry and Molecular Diagnostics, 6th Edition",
      "Clinical Laboratory Standards Institute (CLSI) Guidelines for Glucose Testing"
    ]
  },
  {
    id: 3,
    title: "Tissue Biopsy Analysis - Suspected Breast Carcinoma",
    department: "histopathology",
    description: "Process and analyze breast tissue biopsy from a patient with a suspicious breast mass.",
    patientInfo: {
      age: 49,
      gender: "Female",
      symptoms: ["Palpable right breast mass", "No skin changes", "No nipple discharge"],
      medicalHistory: "Mother diagnosed with breast cancer at age 52, otherwise healthy",
      currentMedications: ["Multivitamin daily"]
    },
    specimens: [
      {
        type: "Core needle biopsy from right breast mass",
        collectionMethod: "Ultrasound-guided core needle biopsy",
        appearance: "3 cores of firm, white tissue, 1-2cm each",
        image: getDemoImage('histopathology', 0)
      }
    ],
    procedure: [
      {
        id: 1,
        name: "Specimen Reception and Grossing",
        description: "Receive, document, and prepare the biopsy specimen for processing.",
        image: getDemoImage('histopathology', 0),
        tools: [
          { id: 1, name: "Cassettes", icon: "inventory_2" },
          { id: 2, name: "Forceps", icon: "health_and_safety" },
          { id: 3, name: "Dissection Board", icon: "crop_square" }
        ],
        targets: [
          { id: 1, position: { x: 30, y: 35 }, size: { width: 20, height: 20 } },
          { id: 2, position: { x: 60, y: 40 }, size: { width: 25, height: 20 } }
        ],
        feedback: {
          success: "Specimen correctly received, documented and prepared for processing!",
          error: "Improper specimen handling can compromise tissue integrity and diagnosis."
        },
        detailedInstructions: [
          "Verify specimen details match requisition form",
          "Photograph specimen if required by protocol",
          "Measure and describe each core (length, color, consistency)",
          "Place tissue cores in labeled cassette",
          "Ensure adequate fixative coverage",
          "Complete specimen tracking documentation"
        ],
        safetyNotes: [
          "Handle fresh tissue as potentially infectious",
          "Use appropriate PPE: gloves, lab coat, and eye protection",
          "Use sharps with caution and dispose properly"
        ]
      },
      {
        id: 2,
        name: "Fixation",
        description: "Fix the tissue in 10% neutral buffered formalin to preserve cellular architecture.",
        image: getDemoImage('histopathology', 1),
        tools: [
          { id: 1, name: "Formalin Container", icon: "inventory_2" },
          { id: 2, name: "Timer", icon: "timer" }
        ],
        targets: [
          { id: 1, position: { x: 45, y: 45 }, size: { width: 25, height: 25 } }
        ],
        feedback: {
          success: "Tissue properly fixed in appropriate fixative!",
          error: "Inadequate fixation can lead to poor histological quality and difficult diagnosis."
        },
        scientificPrinciple: "Formalin creates cross-links between proteins, preserving tissue architecture and preventing autolysis and decomposition of cellular components.",
        detailedInstructions: [
          "Ensure tissue is immersed in 10% neutral buffered formalin",
          "Maintain a tissue:fixative ratio of at least 1:10",
          "Fix breast core biopsies for 6-8 hours (minimum)",
          "Do not exceed 24 hours of fixation for optimal immunohistochemistry",
          "Agitate container occasionally to ensure even fixation"
        ]
      },
      {
        id: 3,
        name: "Tissue Processing",
        description: "Process the fixed tissue through dehydration, clearing, and paraffin infiltration.",
        image: getDemoImage('histopathology', 2),
        tools: [
          { id: 1, name: "Tissue Processor", icon: "settings" },
          { id: 2, name: "Processing Chemicals", icon: "science" }
        ],
        targets: [
          { id: 1, position: { x: 45, y: 40 }, size: { width: 30, height: 30 } }
        ],
        feedback: {
          success: "Tissue successfully processed through all required steps!",
          error: "Improper processing can affect tissue quality and diagnostic accuracy."
        },
        detailedInstructions: [
          "Load cassettes into tissue processor baskets",
          "Select appropriate processing protocol for breast biopsies",
          "Typical sequence includes:",
          "- Dehydration: Graded alcohols (70%, 80%, 95%, 100%)",
          "- Clearing: Xylene",
          "- Infiltration: Molten paraffin wax",
          "Monitor processor throughout run for any errors or alerts"
        ],
        scientificPrinciple: "Processing replaces water in tissues with paraffin wax to provide support during sectioning. Dehydration removes water, clearing agents remove alcohol and are miscible with paraffin, and infiltration saturates tissue with paraffin."
      },
      {
        id: 4,
        name: "Embedding",
        description: "Embed processed tissue in paraffin blocks for microtomy.",
        image: getDemoImage('histopathology', 1),
        tools: [
          { id: 1, name: "Embedding Station", icon: "settings" },
          { id: 2, name: "Forceps", icon: "health_and_safety" },
          { id: 3, name: "Molds", icon: "crop_square" }
        ],
        targets: [
          { id: 1, position: { x: 30, y: 40 }, size: { width: 20, height: 20 } },
          { id: 2, position: { x: 60, y: 45 }, size: { width: 25, height: 20 } }
        ],
        feedback: {
          success: "Tissue correctly embedded in proper orientation!",
          error: "Poor embedding can affect section quality and diagnostic interpretation."
        },
        detailedInstructions: [
          "Heat embedding station to proper temperature (58-62°C)",
          "Select appropriate mold size for the specimen",
          "Fill mold partially with molten paraffin",
          "Transfer tissue from cassette to mold using warm forceps",
          "Orient core biopsies longitudinally in the same plane",
          "Add labeled cassette base on top of mold",
          "Fill completely with paraffin",
          "Cool block on cold plate until solidified"
        ]
      },
      {
        id: 5,
        name: "Microtomy",
        description: "Cut thin sections from the paraffin block for microscopic examination.",
        image: getDemoImage('histopathology', 2),
        tools: [
          { id: 1, name: "Microtome", icon: "content_cut" },
          { id: 2, name: "Water Bath", icon: "hot_tub" },
          { id: 3, name: "Microscope Slides", icon: "crop_landscape" }
        ],
        targets: [
          { id: 1, position: { x: 20, y: 35 }, size: { width: 25, height: 25 } },
          { id: 2, position: { x: 55, y: 40 }, size: { width: 20, height: 20 } },
          { id: 3, position: { x: 80, y: 35 }, size: { width: 15, height: 15 } }
        ],
        feedback: {
          success: "High-quality sections successfully cut and mounted on slides!",
          error: "Poor sectioning technique can lead to artifacts and compromise diagnosis."
        },
        detailedInstructions: [
          "Trim block face to expose tissue",
          "Set microtome to cut at 3-4 micrometers thickness",
          "Cut ribbon of sections",
          "Float sections on water bath (40-45°C)",
          "Pick up sections on positively charged slides",
          "Label slides with case number and level",
          "Prepare multiple levels and extra slides for potential immunohistochemistry",
          "Allow slides to dry on warming table or in 37°C oven"
        ],
        safetyNotes: [
          "Exercise extreme caution with microtome blade",
          "Engage blade lock when not in use",
          "Never leave blade exposed"
        ]
      },
      {
        id: 6,
        name: "Staining",
        description: "Stain tissue sections with H&E (Hematoxylin and Eosin) for microscopic examination.",
        image: getDemoImage('histopathology', 3),
        tools: [
          { id: 1, name: "Staining Racks", icon: "view_module" },
          { id: 2, name: "H&E Stains", icon: "palette" },
          { id: 3, name: "Timer", icon: "timer" }
        ],
        targets: [
          { id: 1, position: { x: 25, y: 40 }, size: { width: 20, height: 20 } },
          { id: 2, position: { x: 50, y: 40 }, size: { width: 20, height: 20 } },
          { id: 3, position: { x: 75, y: 40 }, size: { width: 20, height: 20 } }
        ],
        feedback: {
          success: "Sections properly stained with excellent differentiation!",
          error: "Improper staining can obscure cellular details and hinder diagnosis."
        },
        detailedInstructions: [
          "Deparaffinize sections in xylene (2 changes, 3 minutes each)",
          "Rehydrate through graded alcohols (100%, 95%, 70%)",
          "Rinse in running water",
          "Stain in hematoxylin for 5 minutes",
          "Blue in running tap water for 2 minutes",
          "Differentiate in 1% acid alcohol for 5-10 seconds",
          "Blue in running tap water for 2 minutes",
          "Counterstain in eosin for 30 seconds to 2 minutes",
          "Dehydrate through graded alcohols",
          "Clear in xylene",
          "Mount with coverslip using mounting medium"
        ],
        scientificPrinciple: "Hematoxylin (basic dye) stains acidic structures blue-purple (nuclei), while eosin (acidic dye) stains basic structures pink-red (cytoplasm, collagen)."
      },
      {
        id: 7,
        name: "Microscopic Examination",
        description: "Examine the stained sections under the microscope to evaluate tissue morphology and identify any abnormalities.",
        image: getDemoImage('slides', 3),
        tools: [
          { id: 1, name: "Microscope", icon: "visibility" },
          { id: 2, name: "Slide Tray", icon: "view_module" }
        ],
        targets: [
          { id: 1, position: { x: 45, y: 40 }, size: { width: 30, height: 30 } }
        ],
        feedback: {
          success: "Microscopic examination performed systematically with attention to detail!",
          error: "Cursory examination may miss subtle diagnostic features."
        },
        detailedInstructions: [
          "Begin with low power (4x) to assess overall tissue architecture",
          "Identify normal breast structures (ducts, lobules, stroma)",
          "Scan entire specimen systematically",
          "Switch to higher power (10x, 40x) to examine cellular details",
          "Assess for features of malignancy:",
          "- Architectural distortion",
          "- Cellular pleomorphism",
          "- Nuclear atypia",
          "- Mitotic activity",
          "- Invasive growth pattern",
          "Compare with adjacent normal tissue if present"
        ],
        scientificPrinciple: "Histological diagnosis relies on recognizing patterns of tissue architecture and cellular morphology that deviate from normal structures."
      },
      {
        id: 8,
        name: "Special Stains and Immunohistochemistry",
        description: "Perform additional stains or immunohistochemical markers as needed for definitive diagnosis.",
        image: getDemoImage('histopathology', 3),
        tools: [
          { id: 1, name: "IHC Antibodies", icon: "science" },
          { id: 2, name: "Staining Platform", icon: "dashboard" },
          { id: 3, name: "Control Slides", icon: "crop_landscape" }
        ],
        targets: [
          { id: 1, position: { x: 25, y: 35 }, size: { width: 20, height: 20 } },
          { id: 2, position: { x: 55, y: 40 }, size: { width: 25, height: 25 } },
          { id: 3, position: { x: 85, y: 35 }, size: { width: 10, height: 15 } }
        ],
        feedback: {
          success: "Appropriate special stains and IHC markers selected and properly performed!",
          error: "Inappropriate marker selection or technical errors can lead to misdiagnosis."
        },
        detailedInstructions: [
          "Select appropriate markers based on H&E findings",
          "For suspected breast carcinoma, typical panel includes:",
          "- Cytokeratin markers (CK7, CK20)",
          "- Hormone receptors (ER, PR)",
          "- HER2/neu",
          "- Ki-67 proliferation index",
          "- Myoepithelial markers (p63, calponin) to assess invasion",
          "Include positive and negative controls for each marker",
          "Follow validated protocols for antigen retrieval and staining",
          "Interpret results in context of H&E morphology"
        ],
        scientificPrinciple: "Immunohistochemistry utilizes antibodies to detect specific cellular antigens, aiding in tumor typing, determining origin, and predicting treatment response."
      }
    ],
    expectedResults: {
      findings: "H&E sections show infiltrating nests and cords of pleomorphic epithelial cells with prominent nucleoli and moderate mitotic activity. Immunohistochemistry shows tumor cells positive for CK7, ER (90%), PR (70%), and negative for HER2/neu. Ki-67 proliferation index is 15%.",
      interpretation: "Invasive ductal carcinoma, histologic grade 2 (Nottingham score 6/9), ER/PR positive, HER2 negative.",
      clinicalRelevance: "The hormone receptor status indicates potential benefit from endocrine therapy. The negative HER2 status excludes targeted HER2 therapy. The moderate proliferation index suggests intermediate aggressiveness."
    },
    educationalNotes: [
      "Breast cancer is the most common cancer in women worldwide",
      "Hormone receptor status is the most important predictive factor for response to endocrine therapy",
      "The Nottingham grading system assesses tubule formation, nuclear pleomorphism, and mitotic count",
      "Optimal fixation is critical for accurate hormone receptor and HER2 testing",
      "Multiple levels should be examined as small invasive foci may be missed on a single level"
    ],
    references: [
      "WHO Classification of Tumours of the Breast, 5th Edition",
      "College of American Pathologists (CAP) Protocol for Breast Cancer Specimens",
      "ASCO/CAP Guidelines for Immunohistochemical Testing of Estrogen and Progesterone Receptors in Breast Cancer",
      "ASCO/CAP Guidelines for HER2 Testing in Breast Cancer"
    ]
  }
];

// Function to get scenario by ID
export function getScenarioById(id: number): LabScenario | undefined {
  return labScenarios.find(scenario => scenario.id === id);
}

// Function to get scenarios by department
export function getScenariosByDepartment(department: string): LabScenario[] {
  return labScenarios.filter(scenario => 
    scenario.department.toLowerCase() === department.toLowerCase()
  );
}