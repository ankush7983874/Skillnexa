import sys
import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def create_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    # Color Palette (Dark Theme / Violet Accent)
    BG_DARK = RGBColor(7, 11, 20)        # #070B14
    CARD_BG = RGBColor(15, 23, 42)       # #0F172A
    CARD_BORDER = RGBColor(51, 65, 85)   # #334155
    TEXT_WHITE = RGBColor(255, 255, 255)
    TEXT_MUTED = RGBColor(148, 163, 184) # #94A3B8
    VIOLET = RGBColor(124, 58, 237)      # #7C3AED
    ACCENT_BLUE = RGBColor(59, 130, 246) # #3B82F6
    EMERALD = RGBColor(16, 185, 129)     # #10B981

    blank_layout = prs.slide_layouts[6]

    def set_dark_bg(slide):
        background = slide.background
        fill = background.fill
        fill.solid()
        fill.fore_color.rgb = BG_DARK

    def add_header(slide, title_text, category_text="SKILLNEXA — AI PLATFORM"):
        # Category Tag
        txBox = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.7), Inches(0.4))
        tf = txBox.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = category_text.upper()
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = VIOLET

        # Main Title
        txBox2 = slide.shapes.add_textbox(Inches(0.8), Inches(0.7), Inches(11.7), Inches(0.8))
        tf2 = txBox2.text_frame
        tf2.word_wrap = True
        p2 = tf2.paragraphs[0]
        p2.text = title_text
        p2.font.size = Pt(26)
        p2.font.bold = True
        p2.font.color.rgb = TEXT_WHITE

    # -------------------------------------------------------------
    # SLIDE 1: Title & Introduction Slide (1st Page)
    # -------------------------------------------------------------
    slide1 = prs.slides.add_slide(blank_layout)
    set_dark_bg(slide1)

    # Decorative Card Background
    card1 = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.8), Inches(11.733), Inches(5.9))
    card1.fill.solid()
    card1.fill.fore_color.rgb = CARD_BG
    card1.line.color.rgb = VIOLET
    card1.line.width = Pt(2)

    # Top Badge
    tb_badge = slide1.shapes.add_textbox(Inches(1.2), Inches(1.2), Inches(10), Inches(0.4))
    p = tb_badge.text_frame.paragraphs[0]
    p.text = "✦ REAL-TIME AI MOCK INTERVIEW 2.0 & CAREER ECOSYSTEM"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = ACCENT_BLUE

    # Title
    tb_title = slide1.shapes.add_textbox(Inches(1.2), Inches(1.6), Inches(10.5), Inches(1.1))
    p = tb_title.text_frame.paragraphs[0]
    p.text = "SKILLNEXA"
    p.font.size = Pt(48)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE

    # Subtitle
    tb_sub = slide1.shapes.add_textbox(Inches(1.2), Inches(2.7), Inches(10.5), Inches(0.6))
    p = tb_sub.text_frame.paragraphs[0]
    p.text = "Next-Generation AI Practice Platform for Adaptive Technical & Behavioral Hiring"
    p.font.size = Pt(18)
    p.font.color.rgb = TEXT_MUTED

    # Divider line
    line = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(1.2), Inches(3.4), Inches(10.9), Inches(0.02))
    line.fill.solid()
    line.fill.fore_color.rgb = CARD_BORDER
    line.line.fill.background()

    # Metadata Grid (Team, Developer, Institution)
    # Box 1: Team
    b1 = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.2), Inches(3.7), Inches(3.4), Inches(2.5))
    b1.fill.solid()
    b1.fill.fore_color.rgb = RGBColor(30, 41, 59)
    b1.line.color.rgb = CARD_BORDER
    tf = b1.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "TEAM NAME"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = VIOLET
    p2 = tf.add_paragraph()
    p2.text = "Bytecode"
    p2.font.size = Pt(22)
    p2.font.bold = True
    p2.font.color.rgb = TEXT_WHITE
    p3 = tf.add_paragraph()
    p3.text = "Innovative Tech Developers"
    p3.font.size = Pt(11)
    p3.font.color.rgb = TEXT_MUTED

    # Box 2: Developer
    b2 = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(4.95), Inches(3.7), Inches(3.4), Inches(2.5))
    b2.fill.solid()
    b2.fill.fore_color.rgb = RGBColor(30, 41, 59)
    b2.line.color.rgb = CARD_BORDER
    tf = b2.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "DEVELOPED BY"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = ACCENT_BLUE
    p2 = tf.add_paragraph()
    p2.text = "Ankush Barnala"
    p2.font.size = Pt(20)
    p2.font.bold = True
    p2.font.color.rgb = TEXT_WHITE
    p3 = tf.add_paragraph()
    p3.text = "B.Tech (Information Technology)"
    p3.font.size = Pt(11)
    p3.font.color.rgb = TEXT_MUTED

    # Box 3: Institution
    b3 = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.7), Inches(3.7), Inches(3.4), Inches(2.5))
    b3.fill.solid()
    b3.fill.fore_color.rgb = RGBColor(30, 41, 59)
    b3.line.color.rgb = CARD_BORDER
    tf = b3.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "INSTITUTION"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = EMERALD
    p2 = tf.add_paragraph()
    p2.text = "DDU Gorakhpur"
    p2.font.size = Pt(20)
    p2.font.bold = True
    p2.font.color.rgb = TEXT_WHITE
    p3 = tf.add_paragraph()
    p3.text = "Deen Dayal Upadhyaya Gorakhpur University"
    p3.font.size = Pt(10)
    p3.font.color.rgb = TEXT_MUTED

    # -------------------------------------------------------------
    # SLIDE 2: Problem Statement & Industry Need
    # -------------------------------------------------------------
    slide2 = prs.slides.add_slide(blank_layout)
    set_dark_bg(slide2)
    add_header(slide2, "Problem Statement: The Hiring & Placement Gap")

    probs = [
        ("Lack of Realistic Interview Practice", "Students enter campus placements with zero real-time experience of adaptive technical follow-ups."),
        ("High Rejection in Technical & Soft Skills", "Candidates struggle with English verbal clarity, excessive filler words, and poor problem-solving structure."),
        ("Static Quiz Limitation", "Traditional practice portals use fixed multiple-choice questions instead of dynamic, conversational AI feedback."),
        ("Disconnect in Student Readiness", "Universities lack automated proctored analytics to measure individual placement readiness and skill gaps.")
    ]

    for i, (title, desc) in enumerate(probs):
        col = i % 2
        row = i // 2
        x = Inches(0.8 + col * 5.95)
        y = Inches(1.8 + row * 2.6)

        shape = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(5.75), Inches(2.3))
        shape.fill.solid()
        shape.fill.fore_color.rgb = CARD_BG
        shape.line.color.rgb = CARD_BORDER

        tf = shape.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = f"0{i+1}. {title}"
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = RGBColor(244, 63, 94) # Rose

        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(13)
        p2.font.color.rgb = TEXT_MUTED

    # -------------------------------------------------------------
    # SLIDE 3: The SkillNexa Solution & AI Mock Interview 2.0
    # -------------------------------------------------------------
    slide3 = prs.slides.add_slide(blank_layout)
    set_dark_bg(slide3)
    add_header(slide3, "The Solution: Real-Time AI Interview Practice Platform")

    features = [
        ("🎤 Live MediaDevices System Check", "Mandatory pre-interview checks for Camera, Microphone, Internet connection, and Browser Fullscreen mode."),
        ("🎯 Multi-Role & Tech Stack Practice", "Simulate Technical, Coding, DSA, HR, Behavioral, and Project interviews across 15+ tech stacks."),
        ("⏱ Dynamic Adaptive Questions & Timer", "AI generates follow-up questions tailored to previous student answers with auto-submitting timers."),
        ("👁 Attention & Anti-Cheat Guidance", "Browser-based vision attention detection and tab switch logging with neutral non-accusatory guidance.")
    ]

    for i, (title, desc) in enumerate(features):
        y = Inches(1.7 + i * 1.3)
        shape = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), y, Inches(11.733), Inches(1.15))
        shape.fill.solid()
        shape.fill.fore_color.rgb = CARD_BG
        shape.line.color.rgb = VIOLET if i == 0 else CARD_BORDER

        tf = shape.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = TEXT_WHITE

        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(12)
        p2.font.color.rgb = TEXT_MUTED

    # -------------------------------------------------------------
    # SLIDE 4: 20-Feature AI Intelligence Suite
    # -------------------------------------------------------------
    slide4 = prs.slides.add_slide(blank_layout)
    set_dark_bg(slide4)
    add_header(slide4, "20-Feature Comprehensive AI Intelligence Suite")

    suite_cols = [
        ("Career & Roadmap AI", ["Career Trajectory Predictor", "Skill Coach & Gap Analyzer", "18-Stage DSA Roadmap Coach", "Personalized Weekly Plan Generator"]),
        ("Code & Resume AI", ["Real-Time Coding Debugger", "AI Code Quality Reviewer", "ATS Resume Score Optimizer", "Project Advisor & Ideas"]),
        ("Placement & Insights", ["Placement Readiness Analyzer", "Job Match Explainability", "What-If Career Simulator", "Skill Market Demand Forecast"]),
        ("Analytics & Action", ["Student 360 Diagnostic", "AI Action Center & Tasks", "Personalized Job Alerts", "Learning Materials Generator"])
    ]

    for col_idx, (col_title, items) in enumerate(suite_cols):
        x = Inches(0.8 + col_idx * 2.95)
        shape = slide4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(1.8), Inches(2.8), Inches(5.0))
        shape.fill.solid()
        shape.fill.fore_color.rgb = CARD_BG
        shape.line.color.rgb = CARD_BORDER

        tf = shape.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = col_title
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = ACCENT_BLUE

        for item in items:
            p_item = tf.add_paragraph()
            p_item.text = f"• {item}"
            p_item.font.size = Pt(11)
            p_item.font.color.rgb = TEXT_MUTED

    # -------------------------------------------------------------
    # SLIDE 5: Technical Architecture & Stack
    # -------------------------------------------------------------
    slide5 = prs.slides.add_slide(blank_layout)
    set_dark_bg(slide5)
    add_header(slide5, "Robust Full-Stack & AI Microservice Architecture")

    tech_boxes = [
        ("Frontend Application", "Vite + React + TypeScript", "Modern Dark UI theme (#070710), Lucide icons, Web Speech API, MediaDevices integration, and real-time response rendering.", ACCENT_BLUE),
        ("Backend Express API", "Node.js + Express + TypeScript", "JWT Authentication, mandatory OTP verification, MongoDB Mongoose ODM, and strict Server-Side RBAC middleware.", VIOLET),
        ("AI Microservice Engine", "Python FastAPI", "Sub-second AI scoring, dynamic interview question generation, response evaluation, and 18-stage DSA roadmap logic.", EMERALD)
    ]

    for i, (title, stack, desc, color) in enumerate(tech_boxes):
        x = Inches(0.8 + i * 3.95)
        shape = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(1.8), Inches(3.8), Inches(5.0))
        shape.fill.solid()
        shape.fill.fore_color.rgb = CARD_BG
        shape.line.color.rgb = color

        tf = shape.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(18)
        p.font.bold = True
        p.font.color.rgb = TEXT_WHITE

        p_sub = tf.add_paragraph()
        p_sub.text = stack
        p_sub.font.size = Pt(13)
        p_sub.font.bold = True
        p_sub.font.color.rgb = color

        p_desc = tf.add_paragraph()
        p_desc.text = desc
        p_desc.font.size = Pt(12)
        p_desc.font.color.rgb = TEXT_MUTED

    # -------------------------------------------------------------
    # SLIDE 6: Security & Role-Based Access Control (RBAC)
    # -------------------------------------------------------------
    slide6 = prs.slides.add_slide(blank_layout)
    set_dark_bg(slide6)
    add_header(slide6, "Enterprise Security & Institutional RBAC")

    roles = [
        ("STUDENT", "Public registration with Gmail OTP verification. Access to Mock Interview, Portfolio, and AI Tools."),
        ("COMPANY", "Public registration creates PENDING status. Must be approved by Admin before job posting."),
        ("FACULTY", "Institutional request workflow with PENDING verification status until Admin/College approval."),
        ("INSTITUTION / HOD", "Department analytics, student oversight, and HOD promotion assigned via Admin Console."),
        ("ADMIN", "No public registration allowed. Secure provisioning endpoint to manage users, companies, and logs.")
    ]

    for i, (role, text) in enumerate(roles):
        y = Inches(1.7 + i * 1.05)
        shape = slide6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), y, Inches(11.733), Inches(0.95))
        shape.fill.solid()
        shape.fill.fore_color.rgb = CARD_BG
        shape.line.color.rgb = CARD_BORDER

        tf = shape.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = f"ROLE: {role}"
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = EMERALD if role in ["STUDENT", "ADMIN"] else VIOLET

        p2 = tf.add_paragraph()
        p2.text = text
        p2.font.size = Pt(11)
        p2.font.color.rgb = TEXT_MUTED

    # -------------------------------------------------------------
    # SLIDE 7: Conclusion & Thank You
    # -------------------------------------------------------------
    slide7 = prs.slides.add_slide(blank_layout)
    set_dark_bg(slide7)

    card7 = slide7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.8), Inches(11.733), Inches(5.9))
    card7.fill.solid()
    card7.fill.fore_color.rgb = CARD_BG
    card7.line.color.rgb = VIOLET

    tf = card7.text_frame
    tf.word_wrap = True

    p = tf.paragraphs[0]
    p.text = "THANK YOU!"
    p.font.size = Pt(40)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE
    p.alignment = PP_ALIGN.CENTER

    p2 = tf.add_paragraph()
    p2.text = "SkillNexa — Elevating Career Readiness with AI Intelligence"
    p2.font.size = Pt(18)
    p2.font.color.rgb = ACCENT_BLUE
    p2.alignment = PP_ALIGN.CENTER

    p3 = tf.add_paragraph()
    p3.text = "\nTeam Bytecode | DDU Gorakhpur\nAnkush Barnala (B.Tech IT)"
    p3.font.size = Pt(16)
    p3.font.color.rgb = TEXT_MUTED
    p3.alignment = PP_ALIGN.CENTER

    output_path = "D:\\SkillNexa\\SkillNexa_Presentation_Bytecode.pptx"
    prs.save(output_path)
    print(f"Presentation saved successfully to: {output_path}")

if __name__ == "__main__":
    create_presentation()
