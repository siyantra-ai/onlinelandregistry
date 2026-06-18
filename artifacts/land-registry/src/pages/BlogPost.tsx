import React, { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { blogPosts } from '../data/blogPosts';
import './BlogPost.css';

interface BlogPostProps {
  slug: string;
}

export default function BlogPost({ slug }: BlogPostProps) {
  const [, setLocation] = useLocation();
  const post = blogPosts.find(p => p.slug === slug);

  useEffect(() => {
    if (!post) {
      setLocation('/blog');
    }
  }, [post, setLocation]);

  if (!post) {
    return (
      <div className="container" style={{ padding: '100px 20px', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <main className="blog-post-page">
      <div className="container">
        <article className="blog-post-article">
          <div className="blog-post-meta">
            <Link href="/blog" className="blog-back-link">&larr; Back to Blog</Link>
            <span className="blog-post-date">{post.date}</span>
          </div>
          <h1 className="blog-post-title">{post.title}</h1>
          {post.image && (
            <div className="blog-post-featured-image">
              <img src={post.image} alt={post.title} />
            </div>
          )}
          <div 
            className="blog-post-content"
            dangerouslySetInnerHTML={{ __html: post.content || '' }}
          />
          <div className="blog-post-footer">
            <Link href="/contact" className="blog-cta-button">
              Get Expert Help Today
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}
