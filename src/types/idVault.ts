export interface IDCard {
  id: string;
  cardType: 'Aadhar' | 'Driving License' | 'PAN Card' | 'Other';
  holderName: string;
  idNumber: string;
  expiryDate: string;
  themeColor: string;
}
