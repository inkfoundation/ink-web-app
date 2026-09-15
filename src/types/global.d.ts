declare interface Window {
  OneTrust?: {
    ToggleInfoDisplay: () => void;
    AllowAll: () => void;
    RejectAll: () => void;
    OnConsentChanged: (callback: () => void) => void;
  };
  oneTrustLoaded?: Promise<NonNullable<Window["OneTrust"]>>;
  OnetrustActiveGroups?: string;
  ethereum?: {
    isMetaMask?: boolean;
    request: (args: {
      method: string;
      params?: Array<any>;
    }) => Promise<Array<string>>;
    on?: (event: string, callback: (...args: any[]) => void) => void;
    removeListener?: (
      event: string,
      callback: (...args: any[]) => void
    ) => void;
    providers?: any[];
    networkVersion?: string;
    chainId?: string;
  };
}

type ethereum = Window["ethereum"];
