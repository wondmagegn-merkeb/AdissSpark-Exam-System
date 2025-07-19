import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect to the main public landing page.
  redirect('/home');
}
