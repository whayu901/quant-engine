'use client';

import { Box, Container, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ExpandMore } from '@mui/icons-material';
import { useState } from 'react';

const MotionBox = motion(Box);

const faqs = [
  {
    question: 'How accurate is the AI transcription?',
    answer: 'Our AI achieves 98% accuracy on clear audio across 40+ languages. Accuracy improves with high-quality audio and can be further enhanced with custom vocabulary and speaker models.',
  },
  {
    question: 'What file formats do you support?',
    answer: 'We support all major audio and video formats including MP3, WAV, M4A, MP4, MOV, AVI, and more. Files can be up to 5GB in size for Professional plans and unlimited for Enterprise.',
  },
  {
    question: 'How long does transcription take?',
    answer: 'Transcription is typically 4-5x faster than real-time. A 1-hour interview is usually transcribed in 12-15 minutes. Real-time transcription is also available for live interviews.',
  },
  {
    question: 'Is my data secure and private?',
    answer: 'Absolutely. We use bank-level encryption (AES-256) for data at rest and in transit. We\'re SOC 2 Type II certified and GDPR compliant. Your data is never used to train our models without explicit permission.',
  },
  {
    question: 'Can I use Qual Engine for multiple languages?',
    answer: 'Yes! Professional and Enterprise plans support 40+ languages with automatic language detection. You can even mix languages within the same interview and our AI will identify and transcribe each language accurately.',
  },
  {
    question: 'What kind of AI analysis do you provide?',
    answer: 'Our AI automatically identifies themes, performs sentiment analysis, detects key topics, extracts quotes, and recognizes patterns across interviews. You can also create custom analysis rules tailored to your research questions.',
  },
  {
    question: 'Can I collaborate with my team?',
    answer: 'Yes, Professional and Enterprise plans include full collaboration features. Share projects, assign tasks, leave comments, and work together in real-time. Control permissions with role-based access.',
  },
  {
    question: 'Do you offer a free trial?',
    answer: 'Yes! All plans come with a 14-day free trial with no credit card required. You get full access to all features during the trial period.',
  },
  {
    question: 'Can I export my transcripts and analysis?',
    answer: 'Absolutely. Export transcripts in multiple formats (DOCX, PDF, TXT, SRT, VTT) and analysis reports in Excel or CSV. Enterprise plans also support custom API access.',
  },
  {
    question: 'What happens if I exceed my monthly hours?',
    answer: 'You can purchase additional transcription hours as needed, or upgrade to a higher plan. We\'ll notify you before you reach your limit and provide flexible options to continue your work.',
  },
];

export default function FAQSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [expanded, setExpanded] = useState<string | false>('panel0');

  const handleChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box
      ref={ref}
      sx={{
        py: { xs: 8, md: 12 },
        background: 'linear-gradient(180deg, #F9FAFB 0%, #FFFFFF 100%)',
        position: 'relative',
      }}
    >
      <Container maxWidth="md">
        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          sx={{ textAlign: 'center', mb: 6 }}
        >
          <Typography
            variant="overline"
            sx={{
              color: 'primary.main',
              fontWeight: 700,
              fontSize: '0.9375rem',
              letterSpacing: 1.5,
              mb: 2,
              display: 'block',
            }}
          >
            FAQ
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              mb: 2,
              fontSize: { xs: '2rem', md: '2.75rem' },
              background: 'linear-gradient(135deg, #111827 0%, #4B5563 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Frequently Asked Questions
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto', fontWeight: 400, lineHeight: 1.7 }}
          >
            Everything you need to know about Qual Engine
          </Typography>
        </MotionBox>

        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {faqs.map((faq, index) => (
            <Accordion
              key={index}
              expanded={expanded === `panel${index}`}
              onChange={handleChange(`panel${index}`)}
              sx={{
                mb: 2,
                border: '1px solid',
                borderColor: expanded === `panel${index}` ? 'primary.main' : 'grey.200',
                borderRadius: '12px !important',
                boxShadow: expanded === `panel${index}` ? '0 4px 20px rgba(0, 102, 255, 0.15)' : 'none',
                '&:before': {
                  display: 'none',
                },
                transition: 'all 0.3s ease-in-out',
              }}
            >
              <AccordionSummary
                expandIcon={
                  <ExpandMore
                    sx={{
                      color: expanded === `panel${index}` ? 'primary.main' : 'text.secondary',
                      transition: 'color 0.3s ease-in-out',
                    }}
                  />
                }
                sx={{
                  py: 1,
                  px: 3,
                  '&:hover': {
                    bgcolor: 'rgba(0, 102, 255, 0.02)',
                  },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    fontSize: '1.125rem',
                    color: expanded === `panel${index}` ? 'primary.main' : 'text.primary',
                    transition: 'color 0.3s ease-in-out',
                  }}
                >
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 3, pb: 3 }}>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    lineHeight: 1.8,
                    fontSize: '1rem',
                  }}
                >
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </MotionBox>

        {/* Still have questions CTA */}
        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          sx={{
            mt: 8,
            p: 4,
            textAlign: 'center',
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(0, 102, 255, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
            border: '1px solid',
            borderColor: 'grey.200',
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            Still have questions?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Our team is here to help you get started
          </Typography>
          <Box
            component="a"
            href="mailto:support@qualengine.com"
            sx={{
              display: 'inline-block',
              px: 3,
              py: 1.5,
              borderRadius: 2,
              background: 'linear-gradient(90deg, #0066FF 0%, #8B5CF6 100%)',
              color: 'white',
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(0, 102, 255, 0.3)',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(0, 102, 255, 0.4)',
              },
            }}
          >
            Contact Support
          </Box>
        </MotionBox>
      </Container>
    </Box>
  );
}
