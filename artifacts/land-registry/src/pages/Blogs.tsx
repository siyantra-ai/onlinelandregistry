import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { supabase } from '../db/supabase';
import { allBlogPosts as fallbackPosts } from '../data/blogPosts';
import './Blogs.css';

export default function Blogs() {
  const [posts, setPosts] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  useEffect(() => {
    async function fetchBlogs() {
      if (!supabase) {
        setPosts(fallbackPosts);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('blogs')
          .select('*')
          .eq('is_published', true)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          setPosts(data);
        } else {
          setPosts(fallbackPosts);
        }
      } catch (err) {
        console.error('Error fetching blogs:', err);
        setPosts(fallbackPosts);
      }
    }
    
    fetchBlogs();
  }, []);

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(posts.length / postsPerPage);

  return (
    <main className="blog-page">
      <div className="blog-hero">
        <div className="container">
          <h1 className="blog-main-title">Latest News</h1>
        </div>
      </div>

      <div className="blog-content-wrapper">
        <div className="container">
          <div className="blog-grid">
            {currentPosts.map((post) => (
              <Link 
                key={post.id} 
                href={'/blog/post/' + post.slug}
                className="blog-card"
              >
                {post.image_url ? (
                  <div className="blog-card-image">
                    <img src={post.image_url} alt={post.title} loading="lazy" />
                  </div>
                ) : post.image ? (
                  <div className="blog-card-image">
                    <img src={post.image} alt={post.title} loading="lazy" />
                  </div>
                ) : null}
                <div className="blog-card-content">
                  <h2 className="blog-card-title">{post.title}</h2>
                  <p className="blog-card-excerpt">{post.excerpt}</p>
                  <span className="blog-card-date">{post.date}</span>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="blog-pagination">
              {currentPage > 1 && (
                <button 
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="pagination-btn"
                >
                  « Previous
                </button>
              )}
              
              {[...Array(totalPages)].map((_, index) => {
                const isActive = currentPage === index + 1;
                return (
                  <button
                    key={index + 1}
                    onClick={() => setCurrentPage(index + 1)}
                    className={'pagination-number' + (isActive ? ' active' : '')}
                  >
                    {index + 1}
                  </button>
                );
              })}
              
              {currentPage < totalPages && (
                <button 
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="pagination-btn"
                >
                  Next »
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
