export type PatchData = {
  path: string;
  messages: {
    nodeId: string;
    portletId: string;
    message: (string | number)[];
    valueIndex: number;
    name: string;
  }[];
};
