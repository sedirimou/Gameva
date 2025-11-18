import MainLayout from './MainLayout';

export default function EcommerceLayout({ children, title, description, useGradient = false }) {
  return (
    <MainLayout 
      title={`${title} - Gamava`}
      description={description}
      includeFooter={true}
      useGradient={useGradient}
    >
      <div className="container mx-auto px-4 max-w-6xl pt-20">
        {children}
      </div>
    </MainLayout>
  );
}