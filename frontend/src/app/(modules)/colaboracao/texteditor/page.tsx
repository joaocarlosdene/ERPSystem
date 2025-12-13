import Layout from "@/components/Layout";
import AdvancedEditor from "./components/editor";

const mockUser = { id: "1", name: "João" };
const mockCollaborators = [
  { id: "2", name: "Maria" },
  { id: "3", name: "Carlos" },
];

export default function EditorPage() {
  return (
    <Layout>
    <main className="min-h-screen p-6 bg-gray-900">
      <AdvancedEditor currentUser={mockUser} collaborators={mockCollaborators} />
    </main>
    </Layout>
  );
}
