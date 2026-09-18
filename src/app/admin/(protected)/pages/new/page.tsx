import { NewPageForm } from '@/ui/admin/NewPageForm';

export const metadata = { title: 'New page' };

export default function NewPage() {
  return (
    <div>
      <p className="eyebrow">PAGES</p>
      <h1 className="text-3xl mt-2 mb-6">New page</h1>
      <NewPageForm />
    </div>
  );
}
