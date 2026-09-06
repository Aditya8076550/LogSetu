import crypto from 'crypto';

export const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

export function computeSha256(data: string): string {
  return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
}

export function canonicalizeJson(obj: any): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(item => canonicalizeJson(item)).join(',') + ']';
  }
  const sortedKeys = Object.keys(obj).sort();
  const pairs = sortedKeys.map(key => `${JSON.stringify(key)}:${canonicalizeJson(obj[key])}`);
  return '{' + pairs.join(',') + '}';
}

export function computeCanonicalJsonHash(payload: Record<string, any>): string {
  const canonicalStr = canonicalizeJson(payload);
  return computeSha256(canonicalStr);
}

export function computeChainHash(previousBatchRoot: string, currentMerkleRoot: string, batchId: string): string {
  const payload = `${previousBatchRoot.toLowerCase()}:${currentMerkleRoot.toLowerCase()}:${batchId}`;
  return computeSha256(payload);
}

export interface MerkleProofStep {
  position: 'left' | 'right';
  siblingHash: string;
}

export class MerkleTree {
  public leaves: string[];
  public levels: string[][];
  public root: string;

  constructor(leafHashes: string[]) {
    if (!leafHashes || leafHashes.length === 0) {
      this.leaves = [];
      this.root = computeSha256('');
      this.levels = [[this.root]];
      return;
    }

    this.leaves = leafHashes.map(h => h.toLowerCase());
    this.levels = [this.leaves];
    this.root = '';
    this.buildTree();
  }

  private buildTree(): void {
    let currentLevel = this.leaves;
    while (currentLevel.length > 1) {
      const nextLevel: string[] = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        // If odd number of leaves, duplicate the last leaf
        const right = (i + 1 < currentLevel.length) ? currentLevel[i + 1] : left;
        const combined = left + right;
        const parentHash = computeSha256(combined);
        nextLevel.push(parentHash);
      }
      this.levels.push(nextLevel);
      currentLevel = nextLevel;
    }
    this.root = this.levels[this.levels.length - 1][0];
  }

  public getRoot(): string {
    return this.root;
  }

  public getProof(leafIndex: number): MerkleProofStep[] {
    if (leafIndex < 0 || leafIndex >= this.leaves.length) {
      throw new Error(`Leaf index ${leafIndex} is out of bounds (leaves: ${this.leaves.length})`);
    }

    const proof: MerkleProofStep[] = [];
    let index = leafIndex;

    for (let l = 0; l < this.levels.length - 1; l++) {
      const level = this.levels[l];
      const isRightChild = (index % 2 === 1);
      const siblingIndex = isRightChild ? index - 1 : index + 1;

      let siblingHash: string;
      if (siblingIndex < level.length) {
        siblingHash = level[siblingIndex];
      } else {
        siblingHash = level[index]; // duplicated self
      }

      proof.push({
        position: isRightChild ? 'left' : 'right',
        siblingHash
      });

      index = Math.floor(index / 2);
    }

    return proof;
  }
}

export function verifyMerkleProof(leafHash: string, proof: MerkleProofStep[], expectedRoot: string): boolean {
  let currentHash = leafHash.toLowerCase();
  for (const step of proof) {
    const sibling = step.siblingHash.toLowerCase();
    const combined = step.position === 'left' ? (sibling + currentHash) : (currentHash + sibling);
    currentHash = computeSha256(combined);
  }
  return currentHash.toLowerCase() === expectedRoot.toLowerCase();
}
