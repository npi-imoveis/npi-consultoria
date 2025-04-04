import { ReactNode } from "react";

export interface TitleSectionProps {
  section: string;
  title: string;
  description: string;
  button?: boolean;
  center?: boolean;
}

export function TitleSection(props: TitleSectionProps): ReactNode;
