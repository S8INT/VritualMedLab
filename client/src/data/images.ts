// Stock photo URLs for laboratory equipment, microscope slides, medical lab specimens, clinical laboratory workstations
// We're using free stock photos for the lab simulations

export const laboratoryImages = {
  // Laboratory equipment
  equipment: [
    "/equipment/microscope.jpg",
    "/equipment/centrifuge.jpg",
    "/equipment/incubator.jpg",
    "/equipment/spectrophotometer.jpg",
    "/equipment/autoclave.jpg",
    "/equipment/pcr-machine.jpg",
  ],
  
  // Microscope slides
  slides: [
    "/slides/bacteria-gram-stain.jpg",
    "/slides/blood-smear.jpg",
    "/slides/histology-liver.jpg",
    "/slides/malaria-parasite.jpg",
    "/slides/tissue-section.jpg",
    "/slides/fungal-culture.jpg",
  ],
  
  // Medical lab specimens
  specimens: [
    "/specimens/blood-sample.jpg",
    "/specimens/urine-sample.jpg",
    "/specimens/stool-sample.jpg",
    "/specimens/sputum-sample.jpg",
    "/specimens/csf-sample.jpg",
    "/specimens/tissue-biopsy.jpg",
  ],
  
  // Clinical laboratory workstations
  workstations: [
    "/workstations/microbiology-bench.jpg",
    "/workstations/chemistry-analyzer.jpg",
    "/workstations/histology-workstation.jpg",
    "/workstations/hematology-analyzer.jpg",
  ],
  
  // Department images
  departments: {
    microbiology: "/departments/microbiology.jpg",
    clinicalChemistry: "/departments/clinical-chemistry.jpg",
    histopathology: "/departments/histopathology.jpg",
    hematology: "/departments/hematology.jpg",
    immunology: "/departments/immunology.jpg",
  },

  // Lab simulation images
  simulations: {
    bacterialCulture: "/simulations/bacterial-culture.jpg",
    bloodGlucose: "/simulations/blood-glucose.jpg",
    tissueSample: "/simulations/tissue-sample.jpg",
    malariaParasite: "/simulations/malaria-parasite.jpg",
  },
};

// URLs for demonstration purposes - these will be replaced with actual images in production
// The key is to show implementation of how images would be used
export const getDemoImage = (category: string, index: number = 0): string => {
  // Generate placeholders using external services
  const categories = {
    equipment: "https://images.unsplash.com/photo-1576086213369-97a306d36557?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    slides: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300",
    specimens: "https://images.unsplash.com/photo-1579154341098-e4e158cc7f55?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300", 
    workstations: "https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300",
    microbiology: "https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300",
    clinicalChemistry: "https://images.unsplash.com/photo-1579154341098-e4e158cc7f55?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300",
    histopathology: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300",
    malariaParasite: "https://pixabay.com/get/gbeb76e588d7c9dbfe5f96f85d37a1457d7a294971e26a09d90dfaf46eb66c767bd27919f03287b3de5cd22762f0b072bd18241bbacf16dc53633da3c54018434_1280.jpg",
  };
  
  return categories[category as keyof typeof categories] || categories.equipment;
};
