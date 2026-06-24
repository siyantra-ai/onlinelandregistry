import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { supabase } from '../db/supabase';
import { blogPosts as fallbackPosts } from '../data/blogPosts';
import './BlogPost.css';

interface BlogPostProps {
  slug: string;
}

export default function BlogPost({ slug }: BlogPostProps) {
  const [post, setPost] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const [_, setLocation] = useLocation();

  useEffect(() => {
    async function fetchPost() {
      if (!supabase) {
        const foundPost = fallbackPosts.find(p => p.slug === slug);
        if (foundPost) {
          setPost(foundPost);
          setNotFound(false);
        } else {
          setNotFound(true);
        }
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('blogs')
          .select('*')
          .eq('slug', slug)
          .single();
          
        if (error || !data) {
          const foundPost = fallbackPosts.find(p => p.slug === slug);
          if (foundPost) {
            setPost(foundPost);
            setNotFound(false);
          } else {
            setNotFound(true);
          }
        } else {
          setPost(data);
          setNotFound(false);
        }
      } catch (err) {
        const foundPost = fallbackPosts.find(p => p.slug === slug);
        if (foundPost) {
          setPost(foundPost);
          setNotFound(false);
        } else {
          setNotFound(true);
        }
      }
    }
    
    fetchPost();
  }, [slug]);

  useEffect(() => {
    if (notFound) {
      setLocation('/blog');
    }
  }, [notFound, setLocation]);

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
          {post.image_url ? (
            <div className="blog-post-featured-image">
              <img src={post.image_url} alt={post.title} />
            </div>
          ) : post.image ? (
            <div className="blog-post-featured-image">
              <img src={post.image} alt={post.title} />
            </div>
          ) : null}
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
