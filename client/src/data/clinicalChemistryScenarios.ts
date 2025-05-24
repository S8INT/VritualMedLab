import { LabScenario } from './simulationScenarios';
import { getDemoImage } from './images';

export const clinicalChemistryScenarios: LabScenario[] = [
  {
    id: 10,
    title: "Analyzer Calibration & Quality Control",
    department: "Clinical Chemistry",
    description: "Learn how to perform proper calibration and quality control procedures for a clinical chemistry analyzer to ensure accurate and reliable test results.",
    patientInfo: {
      age: 0, // Not applicable for this scenario
      gender: "N/A",
      symptoms: [],
      medicalHistory: "This scenario focuses on laboratory quality management rather than a specific patient case.",
      currentMedications: []
    },
    specimens: [
      {
        type: "Calibration Standards",
        collectionMethod: "Commercial calibrators",
        appearance: "Clear solutions with known analyte concentrations",
        image: getDemoImage('chemistry', 1)
      },
      {
        type: "Quality Control Samples",
        collectionMethod: "Commercial QC materials",
        appearance: "Normal and abnormal range control materials",
        image: getDemoImage('chemistry', 2)
      }
    ],
    procedure: [
      {
        id: 1,
        name: "Pre-Calibration Check",
        description: "Perform system checks before calibration to ensure analyzer readiness.",
        image: getDemoImage('chemistry', 3),
        tools: [
          {
            id: 1,
            name: "Chemistry Analyzer",
            icon: "biotech"
          },
          {
            id: 2,
            name: "Maintenance Log",
            icon: "description"
          }
        ],
        targets: [
          {
            id: 1,
            position: { x: 250, y: 180 },
            size: { width: 120, height: 80 }
          }
        ],
        feedback: {
          success: "System check completed successfully. The analyzer is ready for calibration.",
          error: "The system check failed. Check maintenance history and troubleshoot before proceeding."
        },
        detailedInstructions: [
          "Check that the analyzer has sufficient water and waste capacity",
          "Verify that all reagents are loaded and have adequate volume",
          "Confirm that the analyzer lamp is functioning properly",
          "Review maintenance logs to ensure regular maintenance is up-to-date"
        ],
        scientificPrinciple: "Regular system checks ensure that the analyzer hardware and basic functions are operating correctly before analytical performance is verified through calibration.",
        safetyNotes: [
          "Ensure proper electrical safety when working with the analyzer",
          "Wear appropriate PPE including gloves and lab coat"
        ],
        commonErrors: [
          "Skipping pre-calibration checks leading to failed calibration",
          "Not documenting system issues in maintenance logs",
          "Attempting calibration with insufficient reagent volumes"
        ]
      },
      {
        id: 2,
        name: "Calibrator Preparation",
        description: "Prepare calibration materials according to manufacturer specifications.",
        image: getDemoImage('chemistry', 4),
        tools: [
          {
            id: 1,
            name: "Calibration Kit",
            icon: "science"
          },
          {
            id: 2,
            name: "Pipettes",
            icon: "colorize"
          },
          {
            id: 3,
            name: "Calibrator Vials",
            icon: "opacity"
          }
        ],
        targets: [
          {
            id: 1,
            position: { x: 200, y: 220 },
            size: { width: 100, height: 60 }
          }
        ],
        feedback: {
          success: "Calibration materials prepared correctly according to specifications.",
          error: "Error in calibrator preparation. Check reconstitution volumes and mixing procedure."
        },
        detailedInstructions: [
          "Check calibrator expiration dates and storage conditions",
          "Reconstitute lyophilized calibrators with exact volume of diluent",
          "Mix gently by inversion - avoid creating bubbles",
          "Allow calibrators to reach room temperature before use",
          "Label prepared calibrators with preparation date and time"
        ],
        scientificPrinciple: "Calibrators contain known concentrations of analytes that establish the relationship between instrument signal and concentration, enabling accurate quantification of patient samples.",
        safetyNotes: [
          "Handle calibrators as if they contain potentially infectious materials",
          "Dispose of used materials in appropriate biohazard containers"
        ],
        commonErrors: [
          "Using expired calibration materials",
          "Incorrect reconstitution volume affecting concentration",
          "Inadequate mixing leading to inhomogeneous solutions",
          "Using calibrators without temperature equilibration"
        ]
      },
      {
        id: 3,
        name: "Analyzer Calibration",
        description: "Run calibration procedure on the analyzer and verify calibration acceptance.",
        image: getDemoImage('chemistry', 5),
        tools: [
          {
            id: 1,
            name: "Chemistry Analyzer",
            icon: "biotech"
          },
          {
            id: 2,
            name: "Calibration Materials",
            icon: "science"
          },
          {
            id: 3,
            name: "Calibration SOP",
            icon: "description"
          }
        ],
        targets: [
          {
            id: 1,
            position: { x: 280, y: 200 },
            size: { width: 120, height: 90 }
          }
        ],
        feedback: {
          success: "Calibration completed successfully. All parameters within acceptable limits.",
          error: "Calibration failed. Review error flags and troubleshoot before proceeding."
        },
        detailedInstructions: [
          "Load calibrators into designated positions in the sample rack",
          "Select calibration protocol in the analyzer software",
          "Select analytes to be calibrated",
          "Initiate calibration sequence",
          "Monitor calibration progress",
          "Review calibration results and acceptance criteria"
        ],
        scientificPrinciple: "Calibration establishes or verifies the mathematical relationship between instrument response and analyte concentration using materials of known concentration.",
        safetyNotes: [
          "Follow manufacturer guidelines for handling analyzer components",
          "Be aware of moving parts during analyzer operation"
        ],
        commonErrors: [
          "Loading calibrators in incorrect positions",
          "Selecting wrong calibration protocol",
          "Failing to check for air bubbles in calibrator samples",
          "Accepting out-of-range calibration without investigation"
        ]
      },
      {
        id: 4,
        name: "Quality Control Testing",
        description: "Run quality control samples to verify calibration and analytical performance.",
        image: getDemoImage('chemistry', 6),
        tools: [
          {
            id: 1,
            name: "QC Materials",
            icon: "science"
          },
          {
            id: 2,
            name: "Chemistry Analyzer",
            icon: "biotech"
          },
          {
            id: 3,
            name: "QC Records",
            icon: "description"
          }
        ],
        targets: [
          {
            id: 1,
            position: { x: 250, y: 220 },
            size: { width: 100, height: 80 }
          }
        ],
        feedback: {
          success: "Quality control results within acceptable ranges. Analyzer is ready for patient testing.",
          error: "Quality control failure detected. Troubleshooting required before processing patient samples."
        },
        detailedInstructions: [
          "Prepare normal and abnormal level QC materials according to instructions",
          "Load QC samples into the analyzer",
          "Run QC protocol for all required analytes",
          "Review QC results against established acceptance criteria",
          "Document QC results in appropriate logs or systems",
          "Evaluate QC trends using Levey-Jennings charts"
        ],
        scientificPrinciple: "Quality control verifies that the analytical system is performing within acceptable limits by analyzing samples with known concentrations and comparing results to established ranges.",
        safetyNotes: [
          "Handle QC materials as potentially infectious",
          "Properly dispose of used QC materials in biohazard waste"
        ],
        commonErrors: [
          "Using QC materials that have exceeded stability limits",
          "Failing to mix QC materials adequately",
          "Not reviewing QC trends over time",
          "Proceeding with patient testing despite QC failures"
        ]
      },
      {
        id: 5,
        name: "Troubleshooting QC Failures",
        description: "Learn systematic approach to investigating and resolving quality control failures.",
        image: getDemoImage('chemistry', 7),
        tools: [
          {
            id: 1,
            name: "QC Data",
            icon: "assessment"
          },
          {
            id: 2,
            name: "Maintenance Tools",
            icon: "build"
          },
          {
            id: 3,
            name: "Troubleshooting Guide",
            icon: "help"
          }
        ],
        targets: [
          {
            id: 1,
            position: { x: 270, y: 190 },
            size: { width: 110, height: 70 }
          }
        ],
        feedback: {
          success: "QC issue successfully identified and resolved. System is now functioning within specifications.",
          error: "Troubleshooting incomplete. Additional investigation needed to resolve QC failures."
        },
        detailedInstructions: [
          "Identify pattern of QC failure (random, systematic, trend)",
          "Review recent maintenance, reagent lot changes, and calibrations",
          "Check analyzer error logs for warnings or failures",
          "Repeat QC using fresh QC material",
          "Perform system maintenance if indicated",
          "Recalibrate if necessary",
          "Document all troubleshooting steps and resolution"
        ],
        scientificPrinciple: "Systematic troubleshooting isolates variables that may affect analytical performance, allowing for targeted intervention to restore system reliability.",
        safetyNotes: [
          "Follow proper procedures when accessing internal analyzer components",
          "Use appropriate PPE when handling reagents and samples"
        ],
        commonErrors: [
          "Making multiple changes simultaneously, obscuring the root cause",
          "Failing to document troubleshooting steps",
          "Not investigating QC trends before failure occurs",
          "Overlooking simple issues like reagent expiration"
        ]
      }
    ],
    expectedResults: {
      findings: "Successful calibration with acceptable quality control results across all test parameters. QC values within 2 standard deviations of the mean for all analytes.",
      interpretation: "The analyzer is correctly calibrated and producing reliable results within defined quality specifications. The system is suitable for patient sample testing.",
      clinicalRelevance: "Proper calibration and quality control are essential for ensuring accurate laboratory results that physicians use for diagnosing, monitoring, and treating patients."
    },
    educationalNotes: [
      "Calibration and QC are foundational practices in ensuring laboratory quality",
      "Regular calibration verification through QC helps detect drift in analytical systems",
      "Understanding Westgard rules for QC interpretation helps identify systematic and random errors",
      "Documentation of calibration and QC is essential for regulatory compliance",
      "Different analytes may require different calibration frequencies based on stability"
    ],
    references: [
      "Clinical Laboratory Standards Institute (CLSI) Guidelines for Laboratory Quality Control",
      "Westgard JO. Basic QC Practices. 4th ed. Westgard QC, Inc.; 2016.",
      "Laboratory instrument manufacturer specific guidelines for calibration procedures"
    ]
  },
  {
    id: 11,
    title: "Reagent Preparation & Storage",
    department: "Clinical Chemistry",
    description: "Learn proper techniques for preparing, validating, and storing reagents used in clinical chemistry testing to ensure accurate and consistent results.",
    patientInfo: {
      age: 0, // Not applicable for this scenario
      gender: "N/A",
      symptoms: [],
      medicalHistory: "This scenario focuses on laboratory reagent management rather than a specific patient case.",
      currentMedications: []
    },
    specimens: [
      {
        type: "Reagent Components",
        collectionMethod: "Commercial reagent kits",
        appearance: "Various chemical solutions and powders",
        image: getDemoImage('chemistry', 8)
      },
      {
        type: "Validation Samples",
        collectionMethod: "Known concentration standards",
        appearance: "Clear solutions with verified values",
        image: getDemoImage('chemistry', 9)
      }
    ],
    procedure: [
      {
        id: 1,
        name: "Reagent Reception & Inspection",
        description: "Properly receive and inspect new reagents to ensure quality and integrity.",
        image: getDemoImage('chemistry', 10),
        tools: [
          {
            id: 1,
            name: "Shipment Documentation",
            icon: "description"
          },
          {
            id: 2,
            name: "Temperature Log",
            icon: "thermostat"
          },
          {
            id: 3,
            name: "Inspection Checklist",
            icon: "checklist"
          }
        ],
        targets: [
          {
            id: 1,
            position: { x: 250, y: 190 },
            size: { width: 100, height: 70 }
          }
        ],
        feedback: {
          success: "Reagents properly received and inspected. All items meet acceptance criteria.",
          error: "Issues detected during inspection. Document discrepancies and contact supplier if necessary."
        },
        detailedInstructions: [
          "Check shipping conditions (temperature indicators, packaging integrity)",
          "Verify that received items match the order and packing list",
          "Inspect for physical damage or contamination",
          "Verify expiration dates are acceptable",
          "Check lot numbers and certificates of analysis",
          "Document reception in inventory system"
        ],
        scientificPrinciple: "Proper inspection ensures reagent integrity has been maintained during shipping and handling, preventing the use of compromised materials that could affect test results.",
        safetyNotes: [
          "Wear gloves when handling reagent containers",
          "Be aware of cold/frozen items that may cause cold burns",
          "Check for leaking containers that may contain hazardous materials"
        ],
        commonErrors: [
          "Failing to check temperature indicators for cold chain items",
          "Not properly documenting lot numbers for traceability",
          "Accepting reagents with insufficient shelf life",
          "Overlooking damaged packaging"
        ]
      },
      {
        id: 2,
        name: "Reagent Preparation",
        description: "Prepare working reagents from concentrated stock solutions according to manufacturer instructions.",
        image: getDemoImage('chemistry', 11),
        tools: [
          {
            id: 1,
            name: "Volumetric Flasks",
            icon: "science"
          },
          {
            id: 2,
            name: "Analytical Balance",
            icon: "scale"
          },
          {
            id: 3,
            name: "Reagent Components",
            icon: "opacity"
          },
          {
            id: 4,
            name: "Preparation Protocol",
            icon: "description"
          }
        ],
        targets: [
          {
            id: 1,
            position: { x: 270, y: 210 },
            size: { width: 120, height: 80 }
          }
        ],
        feedback: {
          success: "Reagents successfully prepared according to protocol specifications.",
          error: "Errors in reagent preparation detected. Review procedure and start again."
        },
        detailedInstructions: [
          "Review preparation protocol and gather all necessary components",
          "Calibrate analytical balance if weighing components",
          "Use appropriate grade water (Type I/II) for dilutions",
          "Measure components with appropriate precision",
          "Mix according to specified procedure (stirring, inversion, etc.)",
          "Adjust pH if required by protocol",
          "Filter solutions if specified",
          "Label prepared reagents with name, concentration, preparation date, expiration date, preparer initials"
        ],
        scientificPrinciple: "Precise reagent preparation ensures correct chemical concentrations and conditions for optimal analytical reactions, directly affecting the accuracy of test results.",
        safetyNotes: [
          "Review SDS for all chemical components before handling",
          "Use appropriate PPE (gloves, lab coat, eye protection)",
          "Prepare volatile or hazardous reagents in a fume hood",
          "Be aware of incompatible chemicals"
        ],
        commonErrors: [
          "Using incorrect grade of water for dilutions",
          "Inaccurate weighing or volume measurements",
          "Improper mixing leading to inhomogeneous solutions",
          "Failing to adjust pH to specified range",
          "Incomplete documentation of preparation"
        ]
      },
      {
        id: 3,
        name: "Reagent Validation",
        description: "Validate newly prepared reagents to ensure they perform as expected before use in patient testing.",
        image: getDemoImage('chemistry', 12),
        tools: [
          {
            id: 1,
            name: "Validation Protocol",
            icon: "description"
          },
          {
            id: 2,
            name: "Validation Samples",
            icon: "science"
          },
          {
            id: 3,
            name: "Chemistry Analyzer",
            icon: "biotech"
          }
        ],
        targets: [
          {
            id: 1,
            position: { x: 250, y: 200 },
            size: { width: 110, height: 70 }
          }
        ],
        feedback: {
          success: "Reagent validation successful. Performance meets all acceptance criteria.",
          error: "Validation failed. Investigate potential causes and prepare new reagents if necessary."
        },
        detailedInstructions: [
          "Run quality control samples with new reagents",
          "Compare results to established acceptance ranges",
          "Perform parallel testing with current reagents if applicable",
          "Check for acceptable background absorbance/signal",
          "Verify calibration curve parameters meet specifications",
          "Test precision by running replicates",
          "Document all validation results"
        ],
        scientificPrinciple: "Validation confirms that prepared reagents react appropriately with analytes, producing accurate and reproducible results before implementation in clinical testing.",
        safetyNotes: [
          "Handle validation samples as potentially infectious",
          "Dispose of waste according to laboratory protocols"
        ],
        commonErrors: [
          "Insufficient validation testing before implementation",
          "Not comparing new reagent lot performance to previous lots",
          "Failing to document validation results",
          "Implementing reagents despite borderline validation results"
        ]
      },
      {
        id: 4,
        name: "Reagent Storage",
        description: "Store reagents according to manufacturer specifications to maintain stability and performance.",
        image: getDemoImage('chemistry', 13),
        tools: [
          {
            id: 1,
            name: "Refrigerator",
            icon: "kitchen"
          },
          {
            id: 2,
            name: "Freezer",
            icon: "ac_unit"
          },
          {
            id: 3,
            name: "Temperature Monitoring System",
            icon: "thermostat"
          },
          {
            id: 4,
            name: "Storage Containers",
            icon: "inventory_2"
          }
        ],
        targets: [
          {
            id: 1,
            position: { x: 230, y: 180 },
            size: { width: 100, height: 60 }
          }
        ],
        feedback: {
          success: "Reagents properly stored according to specified conditions.",
          error: "Improper storage conditions detected. Correct storage issues before proceeding."
        },
        detailedInstructions: [
          "Verify storage temperature requirements for each reagent",
          "Check light sensitivity requirements (amber containers, dark storage)",
          "Position reagents in appropriate storage locations",
          "Ensure refrigerator/freezer temperatures are within range",
          "Check for condensation or signs of contamination",
          "Implement first-in-first-out (FIFO) inventory management",
          "Monitor expiration dates regularly"
        ],
        scientificPrinciple: "Proper storage conditions prevent degradation of reagent components, maintaining chemical integrity and ensuring consistent analytical performance throughout the reagent's shelf life.",
        safetyNotes: [
          "Store incompatible chemicals separately",
          "Ensure flammable materials are stored in appropriate cabinets",
          "Secure hazardous reagents appropriately"
        ],
        commonErrors: [
          "Storing light-sensitive reagents in transparent containers",
          "Placing reagents in incorrect temperature conditions",
          "Failing to monitor storage temperature regularly",
          "Using reagents beyond manufacturer or in-house stability limits",
          "Not labeling working reagents with preparation and expiration dates"
        ]
      },
      {
        id: 5,
        name: "Reagent Troubleshooting",
        description: "Identify and resolve issues related to reagent performance.",
        image: getDemoImage('chemistry', 14),
        tools: [
          {
            id: 1,
            name: "QC Data",
            icon: "assessment"
          },
          {
            id: 2,
            name: "Reagent Documentation",
            icon: "description"
          },
          {
            id: 3,
            name: "Troubleshooting Flowchart",
            icon: "account_tree"
          }
        ],
        targets: [
          {
            id: 1,
            position: { x: 260, y: 200 },
            size: { width: 110, height: 70 }
          }
        ],
        feedback: {
          success: "Reagent issue successfully identified and resolved.",
          error: "Troubleshooting incomplete. Additional investigation needed to resolve reagent issues."
        },
        detailedInstructions: [
          "Review quality control data for patterns suggesting reagent issues",
          "Check reagent appearance for visible abnormalities (precipitation, color change)",
          "Verify storage conditions have been maintained",
          "Review preparation documentation for deviations",
          "Test new reagent lot or preparation if available",
          "Consider instrument-reagent interaction issues",
          "Document all findings and corrective actions"
        ],
        scientificPrinciple: "Systematic investigation of reagent performance issues identifies root causes, allowing for targeted interventions to restore analytical accuracy and precision.",
        safetyNotes: [
          "Follow safety protocols when handling potentially compromised reagents",
          "Properly dispose of degraded or contaminated reagents"
        ],
        commonErrors: [
          "Assuming QC failures are always instrument-related rather than reagent-related",
          "Not checking for reagent contamination or degradation",
          "Failing to document troubleshooting steps and outcomes",
          "Not communicating reagent issues to all laboratory staff"
        ]
      }
    ],
    expectedResults: {
      findings: "Properly prepared, validated, and stored reagents that produce consistent, accurate results within established quality control ranges.",
      interpretation: "Well-managed reagents contribute to reliable analytical performance and minimize test variability over time.",
      clinicalRelevance: "Proper reagent management ensures consistent test results for patient diagnosis and monitoring, preventing erroneous clinical decisions due to reagent-related analytical errors."
    },
    educationalNotes: [
      "Different reagents have unique stability profiles and storage requirements",
      "Reagent preparation precision directly impacts test accuracy and reproducibility",
      "Validation of new reagent lots is essential for maintaining analytical consistency",
      "Documentation of reagent preparation and validation is critical for quality assurance and regulatory compliance",
      "Understanding reagent chemistry helps in effective troubleshooting of analytical issues"
    ],
    references: [
      "Clinical Laboratory Standards Institute (CLSI) Guidelines for Laboratory Reagent Management",
      "Burtis CA, Bruns DE. Tietz Fundamentals of Clinical Chemistry and Molecular Diagnostics. 7th ed. Elsevier; 2014.",
      "Specific reagent package inserts and manufacturer documentation"
    ]
  },
  {
    id: 12,
    title: "Interpreting Abnormal Chemistry Results",
    department: "Clinical Chemistry",
    description: "Learn to recognize patterns of abnormal laboratory results, interpret their clinical significance, and troubleshoot potential analytical interferences.",
    patientInfo: {
      age: 68,
      gender: "Male",
      symptoms: ["Fatigue", "Weight loss", "Increased thirst", "Frequent urination"],
      medicalHistory: "Hypertension for 10 years, recently diagnosed type 2 diabetes mellitus",
      currentMedications: ["Metformin", "Lisinopril", "Aspirin"]
    },
    specimens: [
      {
        type: "Serum",
        collectionMethod: "Venipuncture",
        appearance: "Clear, slight lipemia",
        image: getDemoImage('chemistry', 15)
      },
      {
        type: "Urine",
        collectionMethod: "Random urine sample",
        appearance: "Yellow, clear",
        image: getDemoImage('chemistry', 16)
      }
    ],
    procedure: [
      {
        id: 1,
        name: "Sample Integrity Assessment",
        description: "Evaluate sample quality and identify potential pre-analytical issues.",
        image: getDemoImage('chemistry', 17),
        tools: [
          {
            id: 1,
            name: "Visual Inspection",
            icon: "visibility"
          },
          {
            id: 2,
            name: "Hemolysis Index",
            icon: "opacity"
          },
          {
            id: 3,
            name: "Lipemia Index",
            icon: "opacity"
          },
          {
            id: 4,
            name: "Icterus Index",
            icon: "opacity"
          }
        ],
        targets: [
          {
            id: 1,
            position: { x: 240, y: 180 },
            size: { width: 100, height: 60 }
          }
        ],
        feedback: {
          success: "Sample integrity assessment complete. Identified slight lipemia that may affect certain tests.",
          error: "Incomplete sample assessment. Further evaluation needed before interpretation."
        },
        detailedInstructions: [
          "Visually inspect samples for hemolysis, lipemia, and icterus",
          "Document sample quality indicators (hemolysis, lipemia, icterus indices)",
          "Review collection information for potential pre-analytical issues",
          "Consider the impact of observed interferences on specific test results",
          "Determine if sample quality is sufficient for analysis or requires recollection"
        ],
        scientificPrinciple: "Pre-analytical factors like hemolysis, lipemia, and icterus can interfere with chemical reactions and optical measurements, causing spurious test results that do not reflect the patient's true physiological state.",
        safetyNotes: [
          "Handle all patient samples as potentially infectious",
          "Wear appropriate PPE during sample handling"
        ],
        commonErrors: [
          "Failing to document pre-analytical variables",
          "Not considering the specific impact of interferences on individual tests",
          "Proceeding with analysis despite significant sample integrity issues",
          "Missing signs of sample contamination"
        ]
      },
      {
        id: 2,
        name: "Basic Metabolic Panel Analysis",
        description: "Analyze and interpret electrolyte, renal, and glucose abnormalities.",
        image: getDemoImage('chemistry', 18),
        tools: [
          {
            id: 1,
            name: "Chemistry Analyzer",
            icon: "biotech"
          },
          {
            id: 2,
            name: "Reference Ranges",
            icon: "table_chart"
          },
          {
            id: 3,
            name: "Patient History",
            icon: "history"
          }
        ],
        targets: [
          {
            id: 1,
            position: { x: 260, y: 190 },
            size: { width: 100, height: 70 }
          }
        ],
        feedback: {
          success: "Metabolic panel analysis complete. Significant abnormalities identified in glucose, BUN, and electrolytes.",
          error: "Incomplete analysis. Review all metabolic parameters and their interrelationships."
        },
        detailedInstructions: [
          "Review glucose, BUN, creatinine, and electrolyte results",
          "Compare values to laboratory reference ranges",
          "Calculate anion gap: (Na+ + K+) - (Cl- + HCO3-)",
          "Evaluate for patterns suggesting specific metabolic disturbances",
          "Consider medication effects on results (e.g., metformin on lactate)",
          "Correlate results with patient's clinical information"
        ],
        scientificPrinciple: "Metabolic parameters are interrelated, and their patterns can indicate specific physiological disturbances like acid-base imbalances, renal dysfunction, or metabolic diseases.",
        safetyNotes: [
          "Critical values require immediate notification to healthcare providers",
          "Document all critical value communications"
        ],
        commonErrors: [
          "Failing to calculate anion gap when electrolytes are abnormal",
          "Not considering medication effects on laboratory values",
          "Missing patterns of related abnormalities",
          "Interpreting values in isolation rather than as a pattern"
        ]
      },
      {
        id: 3,
        name: "Liver Function Test Interpretation",
        description: "Analyze and interpret patterns of liver enzyme and function abnormalities.",
        image: getDemoImage('chemistry', 19),
        tools: [
          {
            id: 1,
            name: "Chemistry Analyzer",
            icon: "biotech"
          },
          {
            id: 2,
            name: "Reference Ranges",
            icon: "table_chart"
          },
          {
            id: 3,
            name: "LFT Pattern Guide",
            icon: "description"
          }
        ],
        targets: [
          {
            id: 1,
            position: { x: 250, y: 200 },
            size: { width: 110, height: 70 }
          }
        ],
        feedback: {
          success: "Liver function test interpretation complete. Identified mild transaminitis consistent with metformin therapy.",
          error: "Incomplete liver function analysis. Review enzyme patterns and synthetic function markers."
        },
        detailedInstructions: [
          "Review ALT, AST, ALP, GGT, bilirubin (total and direct), albumin, and total protein",
          "Identify patterns suggesting hepatocellular vs cholestatic injury",
          "Calculate AST/ALT ratio",
          "Evaluate synthetic function (albumin, prothrombin time)",
          "Consider common causes of observed patterns",
          "Correlate with patient history and medications"
        ],
        scientificPrinciple: "Different liver enzymes originate from different hepatic cellular locations, and their release patterns can indicate specific types of liver injury or disease processes.",
        safetyNotes: [
          "Significant liver synthetic dysfunction may indicate serious clinical condition requiring urgent attention"
        ],
        commonErrors: [
          "Misinterpreting isolated mild elevations as clinically significant",
          "Failing to recognize medication-induced liver enzyme elevations",
          "Not considering non-hepatic sources of enzyme elevations",
          "Missing indicators of synthetic dysfunction"
        ]
      },
      {
        id: 4,
        name: "Lipid Profile Analysis",
        description: "Interpret lipid parameters and assess cardiovascular risk factors.",
        image: getDemoImage('chemistry', 20),
        tools: [
          {
            id: 1,
            name: "Chemistry Analyzer",
            icon: "biotech"
          },
          {
            id: 2,
            name: "Lipid Guidelines",
            icon: "description"
          },
          {
            id: 3,
            name: "Risk Calculator",
            icon: "calculate"
          }
        ],
        targets: [
          {
            id: 1,
            position: { x: 270, y: 190 },
            size: { width: 110, height: 70 }
          }
        ],
        feedback: {
          success: "Lipid profile analysis complete. Identified dyslipidemia consistent with diabetic status.",
          error: "Incomplete lipid analysis. Consider all parameters and clinical context."
        },
        detailedInstructions: [
          "Review total cholesterol, HDL, LDL, and triglyceride levels",
          "Calculate non-HDL cholesterol (Total cholesterol - HDL)",
          "Consider fasting status when interpreting triglycerides",
          "Identify patterns consistent with metabolic syndrome",
          "Correlate with patient's diabetes status and cardiovascular risk",
          "Consider effects of medications on lipid values"
        ],
        scientificPrinciple: "Lipid parameters reflect cardiovascular risk through different mechanisms, with LDL contributing to atherosclerosis, HDL offering potential protection, and triglycerides indicating metabolic disturbances.",
        safetyNotes: [
          "Extremely high triglycerides (>1000 mg/dL) may indicate risk for pancreatitis"
        ],
        commonErrors: [
          "Interpreting non-fasting lipid panels without considering the effect on triglycerides",
          "Not calculating non-HDL cholesterol in patients with high triglycerides",
          "Failing to recognize secondary causes of dyslipidemia",
          "Not considering lipid results in context of overall cardiovascular risk"
        ]
      },
      {
        id: 5,
        name: "Advanced Diabetes Markers",
        description: "Analyze HbA1c and other diabetes monitoring parameters.",
        image: getDemoImage('chemistry', 21),
        tools: [
          {
            id: 1,
            name: "Specialized Analyzer",
            icon: "biotech"
          },
          {
            id: 2,
            name: "Diabetes Guidelines",
            icon: "description"
          },
          {
            id: 3,
            name: "Clinical History",
            icon: "history"
          }
        ],
        targets: [
          {
            id: 1,
            position: { x: 250, y: 200 },
            size: { width: 100, height: 70 }
          }
        ],
        feedback: {
          success: "Diabetes marker analysis complete. HbA1c indicates poor glycemic control.",
          error: "Incomplete diabetes assessment. Consider all relevant parameters and potential interferences."
        },
        detailedInstructions: [
          "Review HbA1c results and compare to target ranges",
          "Consider factors that may interfere with HbA1c (hemoglobinopathies, anemia)",
          "Evaluate fructosamine or glycated albumin if available",
          "Correlate with glucose results and patient's symptoms",
          "Consider microalbuminuria testing for early nephropathy",
          "Interpret in context of patient's diabetes management"
        ],
        scientificPrinciple: "HbA1c reflects average blood glucose over approximately 2-3 months and is formed through non-enzymatic glycation of hemoglobin, providing an integrated measure of glycemic control.",
        safetyNotes: [
          "Very high HbA1c may indicate risk for acute complications like hyperosmolar hyperglycemic state"
        ],
        commonErrors: [
          "Not considering conditions that affect red blood cell lifespan when interpreting HbA1c",
          "Failing to correlate HbA1c with glucose measurements",
          "Missing hemoglobinopathies that interfere with some HbA1c assays",
          "Not recognizing discrepancies between HbA1c and clinical presentation"
        ]
      },
      {
        id: 6,
        name: "Analytical Interference Investigation",
        description: "Identify and resolve potential analytical interferences affecting test results.",
        image: getDemoImage('chemistry', 22),
        tools: [
          {
            id: 1,
            name: "Alternative Methods",
            icon: "compare"
          },
          {
            id: 2,
            name: "Sample Treatment",
            icon: "science"
          },
          {
            id: 3,
            name: "Interference Guide",
            icon: "description"
          }
        ],
        targets: [
          {
            id: 1,
            position: { x: 260, y: 190 },
            size: { width: 100, height: 60 }
          }
        ],
        feedback: {
          success: "Interference investigation complete. Lipemia confirmed to affect triglyceride and potentially other results.",
          error: "Incomplete interference analysis. Consider additional investigative steps."
        },
        detailedInstructions: [
          "Review discrepant or unexpected results for potential interferences",
          "Consider sample-specific interferences (hemolysis, lipemia, icterus)",
          "Evaluate for medication interferences reported for affected assays",
          "Perform dilution studies if appropriate",
          "Test by alternative method if available",
          "Consider sample treatment to remove interference (ultracentrifugation for lipemia)",
          "Document findings and actions taken"
        ],
        scientificPrinciple: "Analytical interferences can affect test methods through various mechanisms including spectral interference, chemical interaction with reagents, or physical properties affecting reaction kinetics.",
        safetyNotes: [
          "Some sample treatments involve hazardous chemicals requiring appropriate handling"
        ],
        commonErrors: [
          "Attributing clinical significance to results affected by interferences",
          "Not considering multiple possible interferences",
          "Failing to document interference investigations",
          "Not communicating interference issues to healthcare providers"
        ]
      }
    ],
    expectedResults: {
      findings: "The patient's results show elevated glucose (287 mg/dL), HbA1c (9.8%), moderately elevated triglycerides (320 mg/dL), low HDL (32 mg/dL), mildly elevated liver enzymes (ALT 62 U/L, AST 48 U/L), and early signs of diabetic nephropathy (microalbuminuria).",
      interpretation: "The pattern is consistent with poorly controlled diabetes mellitus with dyslipidemia, mild metformin-associated transaminitis, and early diabetic nephropathy. Lipemia is affecting some test results but not clinically significant after investigation.",
      clinicalRelevance: "These findings indicate the need for improved glycemic control, potential adjustment of diabetes management, and monitoring for diabetic complications. The results provide a baseline for evaluating treatment effectiveness."
    },
    educationalNotes: [
      "Recognizing patterns of related abnormalities is key to accurate interpretation",
      "Pre-analytical variables can significantly impact test results and interpretation",
      "Understanding the biological basis of each test helps in distinguishing pathological from analytical causes of abnormal results",
      "Correlation with patient history and clinical presentation is essential for meaningful interpretation",
      "Knowledge of medication effects on laboratory tests prevents misinterpretation of iatrogenic changes"
    ],
    references: [
      "American Diabetes Association. Standards of Medical Care in Diabetes. Diabetes Care. 2023;46(Suppl 1).",
      "Kahn SE, Cooper ME, Del Prato S. Pathophysiology and treatment of type 2 diabetes: perspectives on the past, present, and future. Lancet. 2014;383(9922):1068-1083.",
      "National Cholesterol Education Program (NCEP) Expert Panel. Third Report of the NCEP Expert Panel on Detection, Evaluation, and Treatment of High Blood Cholesterol in Adults (Adult Treatment Panel III). Circulation. 2002;106(25):3143-3421."
    ]
  }
];