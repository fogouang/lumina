/**
 * Indicatifs proposés à la saisie du téléphone.
 * Le backend normalise ensuite au format +<indicatif><numéro>.
 */
export const DIAL_CODES = [
  { label: "Cameroun (+237)", value: "+237" },
  { label: "Côte d'Ivoire (+225)", value: "+225" },
  { label: "Gabon (+241)", value: "+241" },
  { label: "Congo (+242)", value: "+242" },
  { label: "RD Congo (+243)", value: "+243" },
  { label: "Sénégal (+221)", value: "+221" },
  { label: "Bénin (+229)", value: "+229" },
  { label: "Togo (+228)", value: "+228" },
  { label: "France (+33)", value: "+33" },
  { label: "Belgique (+32)", value: "+32" },
  { label: "Canada (+1)", value: "+1" },
];

export const PHONE_INPUT_REGEX = /^[\d\s.\-()+]{8,20}$/;

/**
 * Construit le numéro complet à partir de l'indicatif et de la saisie.
 * Si l'utilisateur a déjà tapé un indicatif (+ ou 00), on garde sa saisie.
 */
export function buildPhone(dialCode: string, number: string): string {
  const cleaned = (number || "").replace(/[\s.\-()]/g, "");
  if (cleaned.startsWith("+") || cleaned.startsWith("00")) return cleaned;
  return `${dialCode}${cleaned.replace(/^0+/, "")}`;
}