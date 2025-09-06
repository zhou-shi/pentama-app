// lib/progressUtils.ts

type ProposalStage = "submitted" | "under-review" | "approved" | "in-progress" | "revision" | "completed" | "pending" | "rejected";
type HasilStage = "submitted" | "under-review" | "approved" | "in-progress" | "completed" | "rejected" | "revision";
type SidangStage = "submitted" | "under-review" | "approved" | "in-progress" | "completed" | "rejected" | "revision";

interface DocWithStage { stage: string | null | undefined }

type StagePercentMap<TStage extends string> = Record<TStage, number>;

export interface CalcOverallResult {
  overall: number;
  status: "completed" | "blocked" | "in-progress";
  message: string;
  breakdown: {
    proposal: number;
    hasil: number;
    sidang: number;
  };
  activeStage: 'sidang' | 'hasil' | 'proposal' | 'none';
  finalScore?: number | null;
}

const mapProposal: StagePercentMap<ProposalStage> = { "submitted": 10, "under-review": 30, "approved": 50, "in-progress": 70, "pending": 78, "revision": 85, "completed": 100, "rejected": 0 };
const mapHasil: StagePercentMap<HasilStage> = { "submitted": 10, "under-review": 30, "approved": 55, "in-progress": 80, "revision": 85, "completed": 100, "rejected": 0 };
const mapSidang: StagePercentMap<SidangStage> = { "submitted": 10, "under-review": 40, "approved": 60, "in-progress": 80, "revision": 85, "completed": 100, "rejected": 0 };

function pctFromStage<TStage extends string>(stage: TStage | null | undefined, map: StagePercentMap<TStage>): number {
  if (!stage || !map[stage]) return 0;
  return map[stage];
}

export function calcOverall(
  input: {
    proposal?: DocWithStage | null;
    hasil?: DocWithStage | null;
    sidang?: DocWithStage & { finalScore?: number | null } | null;
  }
): CalcOverallResult {
  const breakdown = {
    proposal: pctFromStage(input.proposal?.stage as ProposalStage, mapProposal),
    hasil: pctFromStage(input.hasil?.stage as HasilStage, mapHasil),
    sidang: pctFromStage(input.sidang?.stage as SidangStage, mapSidang),
  };

  const isBlocked = input.proposal?.stage === 'rejected' || input.hasil?.stage === 'rejected' || input.sidang?.stage === 'rejected';
  const isCompleted = input.sidang?.stage === 'completed';
  const activeStage = input.sidang ? 'sidang' : input.hasil ? 'hasil' : input.proposal ? 'proposal' : 'none';

  let overall = 0, message = '', status: CalcOverallResult["status"] = "in-progress";

  if (isCompleted) {
    overall = 100;
    status = "completed";
    message = "Selamat, Anda telah lulus!";
  } else if (isBlocked) {
    const p_prog = input.proposal?.stage !== 'rejected' ? (breakdown.proposal / 100) * 0.33 : 0;
    const h_prog = input.hasil?.stage !== 'rejected' ? (breakdown.hasil / 100) * 0.33 : 0;
    overall = Math.round((p_prog + h_prog) * 100);
    status = "blocked";
    message = "Ada tahapan yang ditolak.";
  } else {
    const p_pct = (breakdown.proposal / 100) * 0.33;
    const h_pct = (breakdown.hasil / 100) * 0.33;
    const s_pct = (breakdown.sidang / 100) * 0.34;
    overall = Math.round((p_pct + h_pct + s_pct) * 100);
    message = `${100 - overall}% menuju kelulusan`;
  }

  if (!isCompleted && overall > 99) overall = 99;

  return { overall, status, message, breakdown, activeStage, finalScore: input.sidang?.finalScore };
}