import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

import {
  bandsFullyValid,
  deepCloneBands,
  getActiveCyberRiskScoreBands,
  getActiveLikelihoodBands,
  setActiveCyberRiskScoreBands,
  setActiveLikelihoodBands,
  type ScoringBandRow,
} from "../data/cyberRiskScoringScales.js";
import { refreshAllCyberRiskScaleLabelsFromConfig } from "../data/cyberRisks.js";
import { markCatalogDirty } from "../data/persistence/catalogStore.js";
import { refreshScenarioScaleLabelsFromConfig } from "../data/scenarios.js";

export type CyberRiskScoringConfigContextValue = {
  cyberScoreBands: ScoringBandRow[];
  setCyberScoreBands: Dispatch<SetStateAction<ScoringBandRow[]>>;
  likelihoodBands: ScoringBandRow[];
  setLikelihoodBands: Dispatch<SetStateAction<ScoringBandRow[]>>;
};

const CyberRiskScoringConfigContext = createContext<CyberRiskScoringConfigContextValue | null>(
  null,
);

export function CyberRiskScoringConfigProvider({ children }: { children: ReactNode }) {
  const [cyberScoreBands, setCyberScoreBands] = useState<ScoringBandRow[]>(() =>
    deepCloneBands([...getActiveCyberRiskScoreBands()]),
  );
  const [likelihoodBands, setLikelihoodBands] = useState<ScoringBandRow[]>(() =>
    deepCloneBands([...getActiveLikelihoodBands()]),
  );

  const value = useMemo(
    (): CyberRiskScoringConfigContextValue => ({
      cyberScoreBands,
      setCyberScoreBands,
      likelihoodBands,
      setLikelihoodBands,
    }),
    [cyberScoreBands, likelihoodBands],
  );

  useEffect(() => {
    if (!bandsFullyValid(cyberScoreBands)) return;
    setActiveCyberRiskScoreBands(cyberScoreBands);
    refreshAllCyberRiskScaleLabelsFromConfig();
    refreshScenarioScaleLabelsFromConfig();
    markCatalogDirty();
  }, [cyberScoreBands]);

  useEffect(() => {
    if (!bandsFullyValid(likelihoodBands)) return;
    setActiveLikelihoodBands(likelihoodBands);
    refreshAllCyberRiskScaleLabelsFromConfig();
    refreshScenarioScaleLabelsFromConfig();
    markCatalogDirty();
  }, [likelihoodBands]);

  return (
    <CyberRiskScoringConfigContext.Provider value={value}>
      {children}
    </CyberRiskScoringConfigContext.Provider>
  );
}

export function useCyberRiskScoringConfig(): CyberRiskScoringConfigContextValue {
  const ctx = useContext(CyberRiskScoringConfigContext);
  if (!ctx) {
    throw new Error("useCyberRiskScoringConfig must be used within CyberRiskScoringConfigProvider");
  }
  return ctx;
}
