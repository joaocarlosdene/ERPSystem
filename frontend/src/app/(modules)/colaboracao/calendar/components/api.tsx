// frontend/app/communication/user/api/userApi.ts
import api from "@/services/api";

export type User = {
  id: string;
  name: string;
  email: string;
};

export async function getUsers(): Promise<User[]> {
  const { data } = await api.get("/users");
  return data;
}
