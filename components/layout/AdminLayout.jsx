import Head from 'next/head';
import DashboardLayout from '../admin/DashboardLayout';

export default function AdminLayout({ children, title = "Admin - Gamava", description = "Admin panel for Gamava", currentPage = "Dashboard" }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <DashboardLayout currentPage={currentPage}>
        {children}
      </DashboardLayout>
    </>
  );
}