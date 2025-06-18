import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name, email, subject, message }: ContactFormData = await req.json()

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: 'All fields are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create email content
    const emailContent = {
      to: 'manasvi.g.agrawal@gmail.com',
      from: 'noreply@your-domain.com', // You'll need to configure this
      subject: `Portfolio Contact: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc; border-radius: 10px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0; color: white;">
            <h2 style="margin: 0; font-size: 24px;">New Contact Form Submission</h2>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">From your portfolio website</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 2px solid #e2e8f0;">
              <h3 style="color: #2d3748; margin: 0 0 10px 0; font-size: 18px;">Contact Information</h3>
              <p style="margin: 5px 0; color: #4a5568;"><strong>Name:</strong> ${name}</p>
              <p style="margin: 5px 0; color: #4a5568;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #667eea; text-decoration: none;">${email}</a></p>
              <p style="margin: 5px 0; color: #4a5568;"><strong>Subject:</strong> ${subject}</p>
            </div>
            
            <div>
              <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px;">Message</h3>
              <div style="background: #f7fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;">
                <p style="margin: 0; color: #2d3748; line-height: 1.6; white-space: pre-wrap;">${message}</p>
              </div>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
              <a href="mailto:${email}?subject=Re: ${subject}" 
                 style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Reply to ${name}
              </a>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #718096; font-size: 14px;">
            <p>This email was sent from your portfolio contact form</p>
            <p>Timestamp: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `,
      text: `
New Contact Form Submission

From: ${name} (${email})
Subject: ${subject}

Message:
${message}

---
Sent from your portfolio website at ${new Date().toLocaleString()}
Reply to: ${email}
      `
    }

    // Send email using a service (you'll need to configure this)
    // For now, we'll use a placeholder - you'll need to set up an email service
    
    // Option 1: Using SendGrid (recommended)
    const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: 'manasvi.g.agrawal@gmail.com', name: 'Manasvi Agrawal' }],
          subject: emailContent.subject
        }],
        from: { 
          email: 'contact@your-portfolio.com', // You'll need to verify this domain
          name: 'Portfolio Contact Form' 
        },
        reply_to: { 
          email: email, 
          name: name 
        },
        content: [
          {
            type: 'text/html',
            value: emailContent.html
          },
          {
            type: 'text/plain',
            value: emailContent.text
          }
        ]
      })
    })

    if (!sendGridResponse.ok) {
      throw new Error('Failed to send email via SendGrid')
    }

    // Log the submission (optional - for your records)
    console.log(`Contact form submission from ${name} (${email}): ${subject}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully! I\'ll get back to you soon.' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error sending contact email:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send email. Please try again or contact me directly.',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})