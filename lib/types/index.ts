// Shared TypeScript types for the application

export type Transaction = {
  id: string;
  amount: number;
  date: string;
  description: string;
  categoryId: string;
};

export type Category = {
  id: string;
  name: string;
  color: string;
};
