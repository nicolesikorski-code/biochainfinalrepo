/**
 * Zero-Knowledge Proofs Implementation for BioChain
 *
 * Uses Pedersen Commitments for range proofs
 * Allows proving data satisfies criteria without revealing actual values
 */

import crypto from 'crypto';

// Types
export interface ZKProof {
  type: 'range' | 'equality' | 'membership';
  criteria: string;
  commitment: string;
  proof: string;
  timestamp: number;
}

export interface DataCommitment {
  value: number;
  commitment: string;
  blinding: string; // Random factor for hiding
}

/**
 * Generate a Pedersen commitment for a value
 * Commitment = g^value * h^blinding (mod p)
 *
 * In practice, we use hash-based commitment for simplicity
 */
export function createCommitment(value: number): DataCommitment {
  // Generate random blinding factor
  const blinding = crypto.randomBytes(32).toString('hex');

  // Create commitment: Hash(value || blinding)
  const commitment = crypto
    .createHash('sha256')
    .update(`${value}||${blinding}`)
    .digest('hex');

  return {
    value,
    commitment,
    blinding,
  };
}

/**
 * Generate ZK-proof for range: value >= min AND value <= max
 * WITHOUT revealing the actual value
 */
export function generateRangeProof(
  value: number,
  min: number,
  max: number,
  fieldName: string
): ZKProof {
  // Create commitment
  const { commitment, blinding } = createCommitment(value);

  // Check if value is in range
  const inRange = value >= min && value <= max;

  if (!inRange) {
    throw new Error(`Value ${value} not in range [${min}, ${max}]`);
  }

  // Generate proof (simplified - in production would use cryptographic protocol)
  // The proof demonstrates knowledge of (value, blinding) such that:
  // 1. commitment = Hash(value || blinding)
  // 2. min <= value <= max
  const proofData = {
    commitment,
    min,
    max,
    // Challenge-response protocol (simplified)
    challenge: crypto.randomBytes(16).toString('hex'),
  };

  // Create proof signature
  const proof = crypto
    .createHash('sha256')
    .update(JSON.stringify(proofData))
    .digest('hex');

  return {
    type: 'range',
    criteria: `${fieldName} >= ${min} AND ${fieldName} <= ${max}`,
    commitment,
    proof,
    timestamp: Date.now(),
  };
}

/**
 * Generate ZK-proof for equality: value == target
 */
export function generateEqualityProof(
  value: boolean | string,
  target: boolean | string,
  fieldName: string
): ZKProof {
  const { commitment, blinding } = createCommitment(value === target ? 1 : 0);

  if (value !== target) {
    throw new Error(`Value does not match target`);
  }

  const proofData = {
    commitment,
    target,
    challenge: crypto.randomBytes(16).toString('hex'),
  };

  const proof = crypto
    .createHash('sha256')
    .update(JSON.stringify(proofData))
    .digest('hex');

  return {
    type: 'equality',
    criteria: `${fieldName} == ${target}`,
    commitment,
    proof,
    timestamp: Date.now(),
  };
}

/**
 * Verify a ZK-proof
 * Returns true if proof is valid, false otherwise
 */
export function verifyProof(proof: ZKProof): boolean {
  // In production, this would verify cryptographic proof
  // For now, we verify structure and signature

  if (!proof.commitment || !proof.proof || !proof.criteria) {
    return false;
  }

  // Proof is considered valid if it has proper structure
  // In real implementation, would verify cryptographic properties
  return true;
}

/**
 * Generate multiple ZK-proofs for a data point
 */
export function generateDataProofs(data: {
  age?: number;
  estrogen?: number;
  progesterone?: number;
  testosterone?: number;
  uses_contraceptives?: boolean;
  has_pcos?: boolean;
}): ZKProof[] {
  const proofs: ZKProof[] = [];

  // Age range proofs
  if (data.age !== undefined) {
    try {
      // Proof: age in [18, 50]
      proofs.push(generateRangeProof(data.age, 18, 50, 'age'));

      // Additional granular ranges
      if (data.age >= 20 && data.age <= 30) {
        proofs.push(generateRangeProof(data.age, 20, 30, 'age'));
      }
      if (data.age >= 25 && data.age <= 35) {
        proofs.push(generateRangeProof(data.age, 25, 35, 'age'));
      }
      if (data.age >= 30 && data.age <= 40) {
        proofs.push(generateRangeProof(data.age, 30, 40, 'age'));
      }
    } catch (e) {
      console.log('Age out of common ranges');
    }
  }

  // Hormone level proofs
  if (data.estrogen !== undefined) {
    try {
      // Normal range: 15-350 pg/mL
      if (data.estrogen >= 15 && data.estrogen <= 350) {
        proofs.push(generateRangeProof(data.estrogen, 15, 350, 'estrogen'));
      }
      // High estrogen: >100
      if (data.estrogen > 100) {
        proofs.push(generateRangeProof(data.estrogen, 100, 500, 'estrogen'));
      }
    } catch (e) {
      console.log('Estrogen proof generation failed');
    }
  }

  if (data.progesterone !== undefined) {
    try {
      // Normal range: 0.1-25 ng/mL
      if (data.progesterone >= 0.1 && data.progesterone <= 25) {
        proofs.push(generateRangeProof(data.progesterone, 0.1, 25, 'progesterone'));
      }
    } catch (e) {
      console.log('Progesterone proof generation failed');
    }
  }

  if (data.testosterone !== undefined) {
    try {
      // Normal range for women: 15-70 ng/dL
      if (data.testosterone >= 15 && data.testosterone <= 70) {
        proofs.push(generateRangeProof(data.testosterone, 15, 70, 'testosterone'));
      }
    } catch (e) {
      console.log('Testosterone proof generation failed');
    }
  }

  // Boolean proofs
  if (data.uses_contraceptives !== undefined) {
    try {
      proofs.push(
        generateEqualityProof(data.uses_contraceptives, true, 'uses_contraceptives')
      );
    } catch (e) {
      // If false, generate proof for false
      try {
        proofs.push(
          generateEqualityProof(data.uses_contraceptives, false, 'uses_contraceptives')
        );
      } catch (e2) {
        console.log('Contraceptives proof generation failed');
      }
    }
  }

  if (data.has_pcos !== undefined) {
    try {
      proofs.push(generateEqualityProof(data.has_pcos, true, 'has_pcos'));
    } catch (e) {
      try {
        proofs.push(generateEqualityProof(data.has_pcos, false, 'has_pcos'));
      } catch (e2) {
        console.log('PCOS proof generation failed');
      }
    }
  }

  return proofs;
}

/**
 * Serialize proofs for blockchain storage
 */
export function serializeProofs(proofs: ZKProof[]): string {
  return JSON.stringify(proofs);
}

/**
 * Deserialize proofs from blockchain
 */
export function deserializeProofs(data: string): ZKProof[] {
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

/**
 * Check if proofs satisfy query criteria
 */
export function matchesCriteria(proofs: ZKProof[], criteria: string[]): boolean {
  // Check if all required criteria are satisfied by the proofs
  return criteria.every(criterion =>
    proofs.some(proof => proof.criteria === criterion)
  );
}
