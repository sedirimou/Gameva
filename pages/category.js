import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function CategoryRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the dynamic category page with query parameters
    const { ...query } = router.query;
    
    // Create the redirect URL with query parameters - preserve proper category structure
    const queryString = new URLSearchParams(query).toString();
    const redirectUrl = queryString ? `/category/products?${queryString}` : '/category/products';
    
    router.replace(redirectUrl);
  }, [router]);

  return null; // This component only handles redirects
}