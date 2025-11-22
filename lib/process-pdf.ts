export async function generateFileHash(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export async function processPDF(file: File) {
  // Simular delay de procesamiento con Nvidia CVM
  await new Promise(resolve => setTimeout(resolve, 3000));

  const fileHash = await generateFileHash(file);

  // Mock: Simular extracción de datos
  const mockExtractedData = {
    lab_name: ["Laboratorio Central", "Lab Consulmed", "Diagnóstico Integral"][Math.floor(Math.random() * 3)],
    test_date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    hormones: {
      progesterone: `${(Math.random() * 20 + 5).toFixed(2)} ng/mL`,
      estrogen: `${(Math.random() * 200 + 50).toFixed(2)} pg/mL`,
      testosterone: `${(Math.random() * 1 + 0.1).toFixed(2)} ng/mL`,
      fsh: `${(Math.random() * 15 + 2).toFixed(2)} mIU/mL`,
      lh: `${(Math.random() * 20 + 3).toFixed(2)} mIU/mL`,
    },
    patient_data_removed: true,
    processed_with_cvm: true,
  };

  return {
    fileHash,
    extractedData: mockExtractedData,
  };
}

export function validatePDFFile(file: File): { valid: boolean; error?: string } {
  // Validar que sea un PDF
  if (file.type !== 'application/pdf') {
    return { valid: false, error: 'El archivo debe ser un PDF' };
  }

  // Validar tamaño (máximo 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: 'El archivo no debe superar los 10MB' };
  }

  return { valid: true };
}
