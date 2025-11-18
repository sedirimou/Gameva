import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import LeeCMSRenderer from '../../components/cms/LeeCMSRenderer';
import MainLayout from '../../components/layout/MainLayout';
import HelpCenter from '../../components/help-center/HelpCenter';

export default function DynamicPage({ page, slug }) {
  const router = useRouter();

  if (!page) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-[#153e8f] to-[#0a1b3d] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Page Not Found</h1>
            <p className="text-white/80 mb-6">The page you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push('/')}
              className="bg-gradient-to-r from-[#99b476] to-[#29adb2] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-xl transition-all duration-300"
            >
              Back to Home
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Special case for Help Center - use the full Help Center component
  if (slug === 'help-center') {
    return <HelpCenter />;
  }

  return (
    <MainLayout>
      <LeeCMSRenderer content={page?.content_json || []} />
    </MainLayout>
  );
}

// Static paths for better SEO and performance
// Use getServerSideProps for dynamic pages
export async function getServerSideProps({ params }) {
  const { slug } = params;

  try {
    // Use internal database query instead of HTTP fetch
    const { query } = await import('../../lib/database');
    
    const result = await query(
      `
        SELECT 
          p.id,
          p.title,
          p.slug,
          p.type,
          p.content_json,
          p.html_content,
          p.page_category_id,
          pc.name as category_name,
          pc.slug as category_slug,
          p.meta_title,
          p.meta_description,
          p.is_active,
          p.sort_order,
          p.created_at,
          p.updated_at
        FROM pages p
        LEFT JOIN page_categories pc ON p.page_category_id = pc.id
        WHERE p.slug = $1 AND p.is_active = true
      `,
      [slug]
    );

    if (result.rows.length === 0) {
      return {
        notFound: true
      };
    }

    const page = result.rows[0];

    // Parse content_json if it's a string
    if (typeof page.content_json === 'string') {
      try {
        page.content_json = JSON.parse(page.content_json);
      } catch (e) {
        console.error('Error parsing content_json:', e);
        page.content_json = [];
      }
    }

    // Convert dates to strings for JSON serialization
    const serializedPage = {
      ...page,
      created_at: page.created_at ? page.created_at.toISOString() : null,
      updated_at: page.updated_at ? page.updated_at.toISOString() : null
    };

    return {
      props: {
        page: serializedPage,
        slug
      }
    };
  } catch (error) {
    console.error('Error fetching page:', error);
    return {
      notFound: true
    };
  }
}

