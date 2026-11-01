import type { Profile } from './profile';

export interface CallSource {
  title: string;
  description: string;
  number?: string;
  fromProfile?: 'waterCompany' | 'gp';
}

export interface ResolvedCall {
  title: string;
  description: string;
  /** Number as shown, selectable plain text. */
  number?: string;
  /** Digits for a `tel:` link, whitespace removed. */
  tel?: string;
}

/** Resolve a call card to what is shown: fixed numbers as-is, profile ones from saved contacts. */
export function resolveCall(card: CallSource, profile: Profile | null): ResolvedCall {
  if (card.number) {
    return {
      title: card.title,
      description: card.description,
      number: card.number,
      tel: card.number.replace(/\s+/g, ''),
    };
  }
  const saved = card.fromProfile ? profile?.[card.fromProfile] : undefined;
  if (saved?.phone) {
    return {
      title: card.title,
      description: saved.name || card.description,
      number: saved.phone,
      tel: saved.phone.replace(/\s+/g, ''),
    };
  }
  return { title: card.title, description: 'Not saved yet. Add it in Settings' };
}
