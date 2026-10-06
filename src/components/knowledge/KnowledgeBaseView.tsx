import React, { useState, useEffect, useRef } from 'react';
import {
  Database,
  Upload,
  FileText,
  Trash2,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Lock,
  Globe,
  Plus,
  Play,
  Layers,
  Search,
  AlertCircle,
  FileCode,
  FileSpreadsheet,
  Cpu,
  BookOpen,
  X
} from 'lucide-react';
import { ManagedDocument, DocumentChunk, DocumentType, DocumentVisibility } from '../../types/rag';
import { VectorStoreManager } from '../../services/rag/vectorStore';
import { DocumentProcessor } from '../../services/rag/documentProcessor';
import { StorageService } from '../../services/storageService';
import { initializeSeedKnowledgeBase } from '../../data/seedKnowledgeBase';
import { EmbeddingFactory } from '../../services/rag/embeddingProvider';
import { RagEvaluationModal } from '../rag/RagEvaluationModal';

export const KnowledgeBaseView: React.FC = () => {
  const profile = StorageService.getProfile();
  const [documents, setDocuments] = useState<ManagedDocument[]>([]);
  const [selectedDocChunks, setSelectedDocChunks] = useState<DocumentChunk[] | null>(null);
  const [activeViewingDoc, setActiveViewingDoc] = useState<ManagedDocument | null>(null);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [uploadCategory, setUploadCategory] = useState<DocumentType>('USER_RESUME');
  const [uploadVisibility, setUploadVisibility] = useState<DocumentVisibility>('private');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStatusText, setUploadStatusText] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Evaluation modal
  const [showEvalModal, setShowEvalModal] = useState<boolean>(false);

  // Load documents
  const loadDocs = () => {
    const list = VectorStoreManager.getManagedDocuments(profile.id);
    setDocuments(list);
  };

  useEffect(() => {
    // Ensure initial seed is loaded
    initializeSeedKnowledgeBase(profile.id).then(() => {
      loadDocs();
    });
  }, [profile.id]);

  const handleDelete = async (docId: string, name: string) => {
    if (confirm(`Are you sure you want to remove "${name}" from the vector database?`)) {
      await VectorStoreManager.deleteDocument(docId);
      loadDocs();
      if (activeViewingDoc?.id === docId) {
        setActiveViewingDoc(null);
        setSelectedDocChunks(null);
      }
    }
  };

  const handleReindex = async (doc: ManagedDocument) => {
    try {
      doc.status = 'chunking';
      VectorStoreManager.saveManagedDocument({ ...doc });
      loadDocs();

      // Delete existing chunks
      await VectorStoreManager.deleteDocument(doc.id);

      // Re-index from rawContent if available
      if (doc.rawContent) {
        const dummyFile = new File([doc.rawContent], doc.name, { type: 'text/plain' });
        await DocumentProcessor.ingestFile(dummyFile, profile.id, {
          documentType: doc.documentType,
          visibility: doc.visibility
        });
      }
      loadDocs();
    } catch (e: any) {
      alert(`Reindexing failed: ${e.message}`);
    }
  };

  const handleInspectChunks = async (doc: ManagedDocument) => {
    setActiveViewingDoc(doc);
    const store = VectorStoreManager.getStore();
    const allChunks = await store.getAll({ documentId: doc.id });
    setSelectedDocChunks(allChunks);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploading(true);
    setUploadError('');
    setUploadStatusText('Validating file & format...');

    try {
      await DocumentProcessor.ingestFile(file, profile.id, {
        documentType: uploadCategory,
        visibility: uploadVisibility,
        onStatusUpdate: (st) => {
          if (st === 'processing') setUploadStatusText('Extracting and sanitizing document text...');
          if (st === 'chunking') setUploadStatusText('Generating semantic section chunks...');
          if (st === 'embedding') setUploadStatusText('Computing normalized vector embeddings...');
          if (st === 'indexed') setUploadStatusText('Indexed into Vector Database!');
        }
      });

      loadDocs();
      setShowUploadModal(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setUploadError(err.message || 'Ingestion failed');
    } finally {
      setIsUploading(false);
      setUploadStatusText('');
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      doc.documentType.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesType = typeFilter === 'ALL' || doc.documentType === typeFilter;
    return matchesSearch && matchesType;
  });

  const provider = EmbeddingFactory.getProvider();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Top Banner / Knowledge Base Header */}
      <div className="glass-card" style={{
        padding: '24px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-verified" style={{ fontSize: '0.725rem' }}>
              RAG Knowledge Architecture
            </span>
            <span style={{
              fontSize: '0.7rem',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#10b981',
              fontWeight: 600
            }}>
              {provider.name}
            </span>
          </div>
          <h1 style={{ fontSize: '1.6rem', margin: 0 }}>Knowledge Base & Vector Store</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
            User resumes, project architecture specs, official company JDs, and career guides used for grounded AI reasoning.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setShowEvalModal(true)}
            style={{ padding: '10px 18px', gap: '8px' }}
          >
            <Play size={16} color="var(--primary)" /> Run RAG Benchmark
          </button>

          <button
            className="btn btn-primary"
            onClick={() => setShowUploadModal(true)}
            style={{ padding: '10px 20px', gap: '8px' }}
          >
            <Upload size={16} /> Ingest Document
          </button>
        </div>
      </div>

      {/* RAG Status Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px'
      }}>
        <div className="glass-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Indexed Documents
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
            {documents.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {documents.filter(d => d.visibility === 'private').length} Private • {documents.filter(d => d.visibility === 'public').length} Public
          </div>
        </div>

        <div className="glass-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Semantic Chunks
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary)', marginTop: '4px' }}>
            {documents.reduce((acc, d) => acc + (d.chunksCount || 0), 0)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Section-preserved vector embeddings
          </div>
        </div>

        <div className="glass-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            User Privacy Isolation
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#10b981', marginTop: '4px' }}>
            ENFORCED
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Database-level tenant scoping
          </div>
        </div>

        <div className="glass-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Retrieval Method
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f59e0b', marginTop: '4px' }}>
            Hybrid + Rerank
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Cosine Vector + BM25 Fusion
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ position: 'relative', minWidth: '280px', flex: 1 }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search indexed documents by filename or category..."
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            style={{ paddingLeft: '36px', width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select
            className="input-field"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
          >
            <option value="ALL">All Categories</option>
            <option value="USER_RESUME">User Resume</option>
            <option value="USER_PROJECT">User Projects</option>
            <option value="JOB_DESCRIPTION">Job Descriptions</option>
            <option value="COMPANY_INFORMATION">Company Info</option>
            <option value="INTERVIEW_GUIDE">Interview Guides</option>
            <option value="CAREER_GUIDE">Career Guides</option>
            <option value="LEARNING_RESOURCE">Learning Resources</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border-card)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '14px 20px' }}>Document Name</th>
              <th style={{ padding: '14px 16px' }}>Category</th>
              <th style={{ padding: '14px 16px' }}>Format</th>
              <th style={{ padding: '14px 16px' }}>Chunks</th>
              <th style={{ padding: '14px 16px' }}>Visibility</th>
              <th style={{ padding: '14px 16px' }}>Status</th>
              <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocs.map((doc, idx) => (
              <tr key={doc.id} style={{
                borderBottom: '1px solid var(--border-card)',
                transition: 'background var(--transition-fast)'
              }}>
                <td style={{ padding: '14px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-card-hover)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {doc.fileType === 'pdf' ? <FileText size={16} color="#ef4444" /> :
                        doc.fileType === 'md' ? <FileCode size={16} color="var(--primary)" /> :
                          <FileText size={16} color="var(--text-secondary)" />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{doc.name}</div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                        {(doc.sizeBytes / 1024).toFixed(1)} KB • {new Date(doc.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </td>

                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    fontSize: '0.725rem',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)',
                    background: doc.documentType.startsWith('USER_') ? 'rgba(99, 102, 241, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                    color: doc.documentType.startsWith('USER_') ? 'var(--primary)' : '#f59e0b',
                    fontWeight: 600
                  }}>
                    {doc.documentType.replace(/_/g, ' ')}
                  </span>
                </td>

                <td style={{ padding: '14px 16px', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {doc.fileType}
                </td>

                <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {doc.chunksCount} chunks
                </td>

                <td style={{ padding: '14px 16px' }}>
                  {doc.visibility === 'private' ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <Lock size={12} color="#f59e0b" /> Private
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <Globe size={12} color="#10b981" /> Public
                    </span>
                  )}
                </td>

                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: doc.status === 'indexed' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                    color: doc.status === 'indexed' ? '#10b981' : '#ef4444',
                    fontSize: '0.725rem',
                    fontWeight: 600
                  }}>
                    <CheckCircle2 size={12} /> {doc.status === 'indexed' ? 'Indexed' : doc.status}
                  </span>
                </td>

                <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                    <button
                      onClick={() => handleInspectChunks(doc)}
                      title="Inspect Semantic Chunks"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '6px',
                        borderRadius: 'var(--radius-sm)'
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      onClick={() => handleReindex(doc)}
                      title="Re-index Chunks"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '6px',
                        borderRadius: 'var(--radius-sm)'
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = '#f59e0b'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      <RefreshCw size={16} />
                    </button>

                    <button
                      onClick={() => handleDelete(doc.id, doc.name)}
                      title="Delete from Vector Store"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '6px',
                        borderRadius: 'var(--radius-sm)'
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Semantic Chunks Inspector Modal */}
      {selectedDocChunks && activeViewingDoc && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '24px'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '880px',
            maxHeight: '90vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--border-card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-sidebar)'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Semantic Chunks: {activeViewingDoc.name}
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {selectedDocChunks.length} chunks indexed with section preservation and vector embeddings
                </p>
              </div>

              <button
                onClick={() => { setSelectedDocChunks(null); setActiveViewingDoc(null); }}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {selectedDocChunks.map((chunk, idx) => (
                <div key={chunk.id} style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card-hover)',
                  border: '1px solid var(--border-card)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--primary)',
                        color: '#fff',
                        fontSize: '0.7rem',
                        fontWeight: 700
                      }}>
                        Chunk #{idx + 1}
                      </span>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        Section: {chunk.section}
                      </strong>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {chunk.tokenCount} tokens • Page {chunk.page || 1} • {chunk.embedding ? `Embedding: ${chunk.embedding.length}-dim` : 'No embedding'}
                    </div>
                  </div>

                  <pre style={{
                    fontSize: '0.8rem',
                    lineHeight: 1.5,
                    color: 'var(--text-secondary)',
                    whiteSpace: 'pre-wrap',
                    margin: 0,
                    fontFamily: 'monospace',
                    background: 'rgba(0,0,0,0.2)',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    {chunk.content}
                  </pre>
                </div>
              ))}
            </div>

            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-card)', display: 'flex', justifyContent: 'flex-end', background: 'var(--bg-sidebar)' }}>
              <button
                onClick={() => { setSelectedDocChunks(null); setActiveViewingDoc(null); }}
                className="btn btn-secondary"
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '24px'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '560px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--border-card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-sidebar)'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Ingest New Document into RAG
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Supported formats: PDF, DOCX, TXT, Markdown, HTML (up to 10MB)
                </p>
              </div>

              <button
                onClick={() => setShowUploadModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {uploadError && (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertCircle size={16} />
                  <span>{uploadError}</span>
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Document Category
                </label>
                <select
                  className="input-field"
                  value={uploadCategory}
                  onChange={e => {
                    const cat = e.target.value as DocumentType;
                    setUploadCategory(cat);
                    setUploadVisibility(cat.startsWith('USER_') ? 'private' : 'public');
                  }}
                  style={{ width: '100%', marginTop: '4px' }}
                >
                  <option value="USER_RESUME">USER_RESUME (Candidate Resume)</option>
                  <option value="USER_PROJECT">USER_PROJECT (Architecture & Code Docs)</option>
                  <option value="USER_CERTIFICATE">USER_CERTIFICATE (Verified Credentials)</option>
                  <option value="USER_PROFILE">USER_PROFILE (Profile Overview)</option>
                  <option value="JOB_DESCRIPTION">JOB_DESCRIPTION (Official Job Listing)</option>
                  <option value="COMPANY_INFORMATION">COMPANY_INFORMATION (Verified Company Info)</option>
                  <option value="INTERVIEW_GUIDE">INTERVIEW_GUIDE (Interview Material)</option>
                  <option value="CAREER_GUIDE">CAREER_GUIDE (Career Guidelines)</option>
                  <option value="LEARNING_RESOURCE">LEARNING_RESOURCE (Skill Tutorials)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Access Scope & Privacy
                </label>
                <select
                  className="input-field"
                  value={uploadVisibility}
                  onChange={e => setUploadVisibility(e.target.value as DocumentVisibility)}
                  style={{ width: '100%', marginTop: '4px' }}
                >
                  <option value="private">Private (Restricted strictly to your authenticated user ID)</option>
                  <option value="public">Public (Shared reference knowledge base)</option>
                </select>
              </div>

              {/* Drop area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--border-card)',
                  borderRadius: 'var(--radius-md)',
                  padding: '36px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: 'var(--bg-card-hover)',
                  transition: 'border-color var(--transition-fast)'
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf,.docx,.txt,.md,.html"
                  style={{ display: 'none' }}
                />
                <Upload size={32} color="var(--primary)" style={{ margin: '0 auto 10px' }} />
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Click to select file or drag & drop here
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  PDF, DOCX, TXT, Markdown, or HTML (Max 10MB)
                </div>
              </div>

              {isUploading && (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  color: 'var(--primary)',
                  fontSize: '0.825rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <RefreshCw size={16} className="spin-slow" />
                  <span>{uploadStatusText}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Evaluation Modal */}
      <RagEvaluationModal
        isOpen={showEvalModal}
        onClose={() => setShowEvalModal(false)}
      />
    </div>
  );
};
