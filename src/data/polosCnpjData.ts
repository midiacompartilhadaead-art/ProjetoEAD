export interface PoloCnpjItem {
  polo: string;
  cnpj: string;
}

export const POLOS_CNPJ_DATA: PoloCnpjItem[] = [
  { polo: "Apodi / N. S. Conceição - RN", cnpj: "11.867.141/0001-22" },
  { polo: "Araçatuba / V. São Paulo - SP", cnpj: "65.321.448/0001-52" },
  { polo: "Assis / Centro - SP", cnpj: "43.462.144/0001-72" },
  { polo: "Bauru / Altinópolis - SP", cnpj: "48.773.240/0001-55" },
  { polo: "Belo Horizonte / Centro - MG", cnpj: "55.374.041/0001-30" },
  { polo: "Botucatu / Centro - SP", cnpj: "48.915.905/0001-18" },
  { polo: "Buritirama / Centro - BA", cnpj: "52.359.724/0001-20" },
  { polo: "Campinas / Santa Genebra II - SP", cnpj: "40.632.871/0005-76" },
  { polo: "Canela / Lage de Pedra - RS", cnpj: "26.814.946/0003-47" },
  { polo: "Cariacica / Campo Grande II - ES", cnpj: "14.003.295/0001-64" },
  { polo: "Cuiabá / Centro - MT", cnpj: "34.515.060/0001-69" },
  { polo: "Curitiba / Santa Candida - PR", cnpj: "35.608.261/0001-73" },
  { polo: "Dracena / Centro - SP", cnpj: "23.577.702/0002-19" },
  { polo: "Garça / Williams - SP", cnpj: "33.975.290/0001-48" },
  { polo: "Gravataí / Salgado Filho - RS", cnpj: "26.814.946/0004-28" },
  { polo: "Indaiatuba / Almeida - SP", cnpj: "40.632.871/0001-42" },
  { polo: "Itaboraí / Centro - RJ", cnpj: "21.805.661/0001-64" },
  { polo: "Itanhaém / Praia dos Sonhos - SP", cnpj: "51.467.194/0001-70" },
  { polo: "João Pessoa / Mangabeira - PB", cnpj: "33.721.351/0001-40" },
  { polo: "Juiz de Fora / Alto dos Passos - MG", cnpj: "43.606.643/0001-96" },
  { polo: "Lins / Ariano - SP", cnpj: "45.871.382/0001-67" },
  { polo: "Lucélia / Centro - SP", cnpj: "23.577.702/0001-38" },
  { polo: "Marília / Mirante - SP", cnpj: "44.474.898/0001-05" },
  { polo: "Mianeira / Centro - PR", cnpj: "35.471.787/0001-54" },
  { polo: "Ourinhos / Centro - SP", cnpj: "55.433.914/0001-38" },
  { polo: "Paraguaçu Paulista / Paulista - SP", cnpj: "50.681.265/0001-70" },
  { polo: "Peruíbe / Estação - SP", cnpj: "65.287.330/0001-55" },
  { polo: "Presidente Prudente / Liberdade - SP", cnpj: "62.435.635/0001-79" },
  { polo: "Quatá / Centro - SP", cnpj: "50.903.073/0001-61" },
  { polo: "Ribeirão Cascalheira / Centro - MT", cnpj: "36.494.815/0001-11" },
  { polo: "Ribeirão Preto / América - SP", cnpj: "43.606.643/0002-77" },
  { polo: "São José / Campinas - SC", cnpj: "42.624.164/0001-30" },
  { polo: "São José dos Campos / São Dimas - SP", cnpj: "35.581.449/0001-75" },
  { polo: "São Paulo / Tatuapé - SP", cnpj: "31.916.378/0001-63" },
  { polo: "Serra / Laranjeiras - ES", cnpj: "06.086.290/0001-14" },
  { polo: "Sorocaba / Centro - SP", cnpj: "52.101.849/0001-55" },
  { polo: "Tupã / Centro - SP", cnpj: "23.577.702/0003-08" },
  { polo: "Uberlândia / Martins - MG", cnpj: "33.748.010/0001-69" }
];

export function cleanCnpjDigits(cnpj: string): string {
  if (!cnpj) return '';
  return cnpj.replace(/\D/g, '');
}

export function formatCnpj(cnpj: string): string {
  const digits = cleanCnpjDigits(cnpj);
  if (digits.length !== 14) return cnpj;
  return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

export function findPoloByCnpj(cnpj: string): PoloCnpjItem | undefined {
  const clean = cleanCnpjDigits(cnpj);
  if (!clean) return undefined;
  return POLOS_CNPJ_DATA.find(p => cleanCnpjDigits(p.cnpj) === clean);
}
