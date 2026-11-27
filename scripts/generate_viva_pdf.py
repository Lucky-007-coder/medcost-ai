import os
import io
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, Image, HRFlowable
)
from reportlab.pdfgen import canvas

os.makedirs('scripts/charts', exist_ok=True)

# -------------------------------------------------------------
# 1. GENERATE VISUAL CHARTS USING MATPLOTLIB
# -------------------------------------------------------------

def generate_architecture_chart(path):
    fig, ax = plt.subplots(figsize=(7.5, 2.3), dpi=300)
    fig.patch.set_facecolor('#F8FAF9')
    ax.set_facecolor('#F8FAF9')
    ax.axis('off')

    steps = [
        ("01 Intake", "16-Step Single\nQuestion UI", "#1B4332"),
        ("02 Encoding", "k-1 Baseline\nNo Dummy Trap", "#2D6A4F"),
        ("03 Solver", "Normal Equation\n(X^T X)^-1 X^T y", "#1B4332"),
        ("04 Decomp", "Exact Linear\ny = b0 + S(bj*xj)", "#2D6A4F"),
        ("05 Certified", "ACID SQLite &\nTwo-Pass PDF", "#1B4332")
    ]

    for i, (title, sub, col) in enumerate(steps):
        x = i * 1.5 + 0.1
        y = 0.25
        rect = patches.FancyBboxPatch(
            (x, y), 1.25, 1.45,
            boxstyle="round,pad=0.08,rounding_size=0.15",
            facecolor='#FFFFFF', edgecolor=col, linewidth=1.5
        )
        ax.add_patch(rect)
        pill = patches.FancyBboxPatch(
            (x + 0.05, y + 1.1), 1.15, 0.28,
            boxstyle="round,pad=0.04,rounding_size=0.08",
            facecolor=col, edgecolor='none'
        )
        ax.add_patch(pill)
        ax.text(x + 0.625, y + 1.24, title, color='#FFFFFF', fontsize=8, weight='bold', ha='center', va='center')
        ax.text(x + 0.625, y + 0.55, sub, color='#1F2937', fontsize=7.2, ha='center', va='center', multialignment='center')

        if i < len(steps) - 1:
            ax.annotate('', xy=(x + 1.45, y + 0.72), xytext=(x + 1.28, y + 0.72),
                        arrowprops=dict(arrowstyle="-|>", color='#52B788', lw=2, mutation_scale=12))

    ax.set_xlim(0, 7.5)
    ax.set_ylim(0, 2.0)
    plt.tight_layout()
    plt.savefig(path, bbox_inches='tight', dpi=300)
    plt.close()

def generate_comparison_chart(path):
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(7.2, 2.2), dpi=300)
    fig.patch.set_facecolor('#F8FAF9')
    
    models = ['Model A\n(Demographics)', 'Model B\n(Clinical Profile)']
    r2_scores = [4.54, 16.90]
    colors_bar = ['#52B788', '#1B4332']
    
    ax1.set_facecolor('#FFFFFF')
    bars1 = ax1.bar(models, r2_scores, color=colors_bar, width=0.45, edgecolor='#1B4332', linewidth=1)
    ax1.set_ylabel('Holdout Test R² (%)', fontsize=8, weight='bold', color='#1B4332')
    ax1.set_ylim(0, 22)
    ax1.grid(axis='y', linestyle='--', alpha=0.3)
    ax1.tick_params(axis='both', labelsize=7.5)
    for bar in bars1:
        yval = bar.get_height()
        ax1.text(bar.get_x() + bar.get_width()/2.0, yval + 0.8, f'{yval:.2f}%', ha='center', va='bottom', fontsize=8, weight='bold', color='#1B4332')
    ax1.set_title('Explanatory Power (R²)', fontsize=9, weight='bold', color='#1B4332', pad=6)

    mae_scores = [1934.10, 1778.62]
    ax2.set_facecolor('#FFFFFF')
    bars2 = ax2.bar(models, mae_scores, color=['#74C69D', '#2D6A4F'], width=0.45, edgecolor='#1B4332', linewidth=1)
    ax2.set_ylabel('Mean Absolute Error (USD)', fontsize=8, weight='bold', color='#1B4332')
    ax2.set_ylim(0, 2300)
    ax2.grid(axis='y', linestyle='--', alpha=0.3)
    ax2.tick_params(axis='both', labelsize=7.5)
    for bar in bars2:
        yval = bar.get_height()
        ax2.text(bar.get_x() + bar.get_width()/2.0, yval + 50, f'${yval:,.2f}', ha='center', va='bottom', fontsize=8, weight='bold', color='#1B4332')
    ax2.set_title('Mean Absolute Error (Lower is Better)', fontsize=9, weight='bold', color='#1B4332', pad=6)

    plt.tight_layout()
    plt.savefig(path, bbox_inches='tight', dpi=300)
    plt.close()

def generate_coefficients_chart(path):
    fig, ax = plt.subplots(figsize=(7.2, 2.5), dpi=300)
    fig.patch.set_facecolor('#F8FAF9')
    ax.set_facecolor('#FFFFFF')

    features = [
        'Hospitalizations (last 3 yrs)',
        'Current Smoker',
        'Chronic Count',
        'Former Smoker',
        'Doctor Visits (last yr)',
        'Body Mass Index (BMI)',
        'Age (per year)'
    ]
    coeffs = [1928.25, 1540.40, 926.66, 430.30, 137.20, 28.39, 18.58]
    y_pos = range(len(features))[::-1]

    bar_colors = ['#1B4332', '#2D6A4F', '#40916C', '#52B788', '#74C69D', '#95D5B2', '#B7E4C7']
    bars = ax.barh(y_pos, coeffs, color=bar_colors, edgecolor='#1B4332', height=0.6, linewidth=0.8)

    ax.set_yticks(y_pos)
    ax.set_yticklabels(features, fontsize=7.5, weight='bold', color='#1F2937')
    ax.set_xlabel('Marginal Beta Impact (USD per unit increase)', fontsize=8, weight='bold', color='#1B4332')
    ax.set_xlim(0, 2250)
    ax.grid(axis='x', linestyle='--', alpha=0.3)
    ax.tick_params(axis='both', labelsize=7.5)

    for bar in bars:
        width = bar.get_width()
        ax.text(width + 30, bar.get_y() + bar.get_height()/2.0, f'+${width:,.2f}', ha='left', va='center', fontsize=7.5, weight='bold', color='#1B4332')

    ax.set_title('Model B Empirical Marginal Regressor Weights (β)', fontsize=9, weight='bold', color='#1B4332', pad=6)
    plt.tight_layout()
    plt.savefig(path, bbox_inches='tight', dpi=300)
    plt.close()

# Generate visual assets
arch_chart_path = 'scripts/charts/arch_chart.png'
comp_chart_path = 'scripts/charts/comp_chart.png'
coef_chart_path = 'scripts/charts/coef_chart.png'

generate_architecture_chart(arch_chart_path)
generate_comparison_chart(comp_chart_path)
generate_coefficients_chart(coef_chart_path)

# -------------------------------------------------------------
# 2. REPORTLAB PDF COMPILATION WITH NUMBERED CANVAS
# -------------------------------------------------------------

PRIMARY_FOREST = colors.HexColor('#1B4332')
SECONDARY_FOREST = colors.HexColor('#2D6A4F')
ACCENT_EMERALD = colors.HexColor('#52B788')
SOFT_SAGE = colors.HexColor('#E6EFEA')
DARK_TEXT = colors.HexColor('#111827')
MUTED_TEXT = colors.HexColor('#4B5563')
LIGHT_BORDER = colors.HexColor('#D1D5DB')
CARD_BG = colors.HexColor('#F8FAF9')
CALLOUT_BG = colors.HexColor('#F0F7F4')

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(PRIMARY_FOREST)

        # Running Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(40, 755, "MedCost.ai — Viva Master Defense & Academic Examination Guide")
            self.drawRightString(572, 755, "BTech Undergraduate Research • OLS Linear Regression")
            self.setStrokeColor(LIGHT_BORDER)
            self.setLineWidth(0.5)
            self.line(40, 747, 572, 747)

        # Running Footer (all pages)
        self.setStrokeColor(LIGHT_BORDER)
        self.setLineWidth(0.5)
        self.line(40, 38, 572, 38)

        self.setFont("Helvetica", 8)
        self.setFillColor(MUTED_TEXT)
        self.drawString(40, 26, "MedCost.ai Platform Documentation • Strictly Interpretable Closed-Form Healthcare Economics")
        self.drawRightString(572, 26, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()

def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=40,
        rightMargin=40,
        topMargin=45,
        bottomMargin=45
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=PRIMARY_FOREST
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13,
        textColor=MUTED_TEXT
    )
    h1_style = ParagraphStyle(
        'H1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=PRIMARY_FOREST,
        spaceBefore=10,
        spaceAfter=5
    )
    h2_style = ParagraphStyle(
        'H2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=SECONDARY_FOREST,
        spaceBefore=6,
        spaceAfter=3
    )
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=DARK_TEXT
    )
    body_bold = ParagraphStyle(
        'BodyBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11.5,
        textColor=DARK_TEXT
    )
    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Normal'],
        fontName='Courier-Bold',
        fontSize=8,
        leading=10,
        textColor=PRIMARY_FOREST
    )
    callout_q = ParagraphStyle(
        'CalloutQ',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11.5,
        textColor=PRIMARY_FOREST
    )
    callout_a = ParagraphStyle(
        'CalloutA',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=DARK_TEXT
    )

    story = []

    # ---------------------------------------------------------
    # COVER / HEADER BANNER
    # ---------------------------------------------------------
    header_table = Table([
        [
            Paragraph("<b>MedCost<font color='#52B788'>.ai</font></b>", title_style),
            Paragraph("<b>ACADEMIC VIVA & DEFENSE MASTER GUIDE</b><br/><font color='#4B5563'>BTech Undergraduate Research • Healthcare Predictive Modeling</font>", subtitle_style)
        ]
    ], colWidths=[200, 332])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 4))
    story.append(HRFlowable(width="100%", thickness=1.5, color=PRIMARY_FOREST, spaceAfter=8, spaceBefore=2))

    # Executive Metadata Box
    meta_data = [
        [
            Paragraph("<b>Project:</b> MedCost.ai Actuarial Platform", body_style),
            Paragraph("<b>Core Model:</b> Ordinary Least Squares (OLS)", body_style),
            Paragraph("<b>Dataset:</b> 100,000 Records (80k / 20k)", body_style)
        ],
        [
            Paragraph("<b>Holdout R²:</b> 16.90% (Zero Leakage)", body_style),
            Paragraph("<b>Holdout MAE:</b> $1,778.62 USD", body_style),
            Paragraph("<b>Tests:</b> 15/15 Automated Unit Tests Passed", body_style)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[180, 180, 172])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), SOFT_SAGE),
        ('BOX', (0, 0), (-1, -1), 0.5, SECONDARY_FOREST),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBE0D4')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 8))

    # ---------------------------------------------------------
    # SECTION 1: RESEARCH & COLLABORATOR TEAM MATRIX
    # ---------------------------------------------------------
    story.append(Paragraph("1. Research & Engineering Collaborators Roster", h1_style))
    story.append(Paragraph("MedCost.ai was conceptualized, mathematically formulated, and engineered by a collaborative undergraduate research team. Each member owns a distinct specialization:", body_style))
    story.append(Spacer(1, 4))

    team_data = [
        [
            Paragraph("<b>Member</b>", body_bold),
            Paragraph("<b>Role</b>", body_bold),
            Paragraph("<b>Academic Profile</b>", body_bold),
            Paragraph("<b>Primary Technical Ownership</b>", body_bold)
        ],
        [
            Paragraph("<b>Lucky Gupta</b>", body_bold),
            Paragraph("<font color='#1B4332'><b>Project Lead & Modeling</b></font>", body_style),
            Paragraph("BTech CSE (2nd Year)", body_style),
            Paragraph("OLS Normal Equation solver, zero-leakage covariate selection, and closed-form linear decomposition engine.", body_style)
        ],
        [
            Paragraph("<b>Ahsan Afaque</b>", body_bold),
            Paragraph("<font color='#1B4332'><b>Systems Architecture</b></font>", body_style),
            Paragraph("BTech CSE", body_style),
            Paragraph("Flask REST API microservices, ACID SQLite audit logging, and ReportLab v4 vector PDF certification engine.", body_style)
        ],
        [
            Paragraph("<b>Koushik Badayakar</b>", body_bold),
            Paragraph("<font color='#1B4332'><b>Statistical Auditing</b></font>", body_style),
            Paragraph("BTech CSE", body_style),
            Paragraph("Gauss-Markov BLUE theorem audits, VIF multicollinearity verification (<2.5), and residual diagnostics.", body_style)
        ],
        [
            Paragraph("<b>Kazi Samiul</b>", body_bold),
            Paragraph("<font color='#1B4332'><b>Interactive UI/UX</b></font>", body_style),
            Paragraph("BTech CSE", body_style),
            Paragraph("React 19 single-question onboarding flow (16 steps), live BMI calculator, pitch-black dark mode, Recharts.", body_style)
        ],
        [
            Paragraph("<b>Koustav Ghosh</b>", body_bold),
            Paragraph("<font color='#1B4332'><b>Actuarial Economics</b></font>", body_style),
            Paragraph("BTech CSE", body_style),
            Paragraph("Actuarial risk tiering standards, smoking multipliers (+$1,540.40), and pre-policy demographic risk pooling.", body_style)
        ]
    ]
    team_table = Table(team_data, colWidths=[95, 125, 95, 217])
    team_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_FOREST),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, CARD_BG]),
        ('BOX', (0, 0), (-1, -1), 0.5, LIGHT_BORDER),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, LIGHT_BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    for row_idx in range(len(team_data)):
        if row_idx == 0:
            team_data[row_idx] = [Paragraph(f"<font color='white'>{cell.text}</font>", body_bold) for cell in team_data[row_idx]]
    story.append(team_table)
    story.append(Spacer(1, 10))

    # ---------------------------------------------------------
    # SECTION 2: SYSTEM ARCHITECTURE & 5-STEP PIPELINE
    # ---------------------------------------------------------
    story.append(Paragraph("2. Full-Stack Architecture & Continuous Audit Pipeline", h1_style))
    story.append(Paragraph("The platform enforces continuous auditability across a 5-step serialized architecture from raw clinical intake to certified PDF dispatches:", body_style))
    story.append(Spacer(1, 4))
    
    # Embed Architecture Flow Diagram
    story.append(Image(arch_chart_path, width=530, height=162))
    story.append(Spacer(1, 6))

    steps_summary = [
        [
            Paragraph("<b>Stage</b>", body_bold),
            Paragraph("<b>Implementation Details & Technical Guarantees</b>", body_bold)
        ],
        [
            Paragraph("<b>01 Intake</b>", code_style),
            Paragraph("12 pre-policy clinical & demographic predictors collected via the 16-step single-question onboarding flow.", body_style)
        ],
        [
            Paragraph("<b>02 Matrix Encoding</b>", code_style),
            Paragraph("Categorical variables dummy-encoded with k-1 baselines (Female, Never-Smoker, Central, HMO) to eliminate the Dummy Variable Trap.", body_style)
        ],
        [
            Paragraph("<b>03 Normal Equations</b>", code_style),
            Paragraph("Evaluates exact closed-form global minimum β̂ = (XᵀX)⁻¹ Xᵀy trained on 80,000 policyholders without black-box approximations.", body_style)
        ],
        [
            Paragraph("<b>04 Linear Attribution</b>", code_style),
            Paragraph("Decomposes predicted cost into exact feature dollar contributions ŷ = β₀ + Σ(βⱼ · xⱼ) verified to machine tolerance (≤ 10⁻⁶ USD).", body_style)
        ],
        [
            Paragraph("<b>05 Ledger & PDF</b>", code_style),
            Paragraph("Persists immutable prediction records to ACID SQLite (predictions.db) and compiles certified ReportLab two-pass vector PDFs.", body_style)
        ]
    ]
    steps_table = Table(steps_summary, colWidths=[100, 432])
    steps_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), SECONDARY_FOREST),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, CARD_BG]),
        ('BOX', (0, 0), (-1, -1), 0.5, LIGHT_BORDER),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, LIGHT_BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    for row_idx in range(len(steps_summary)):
        if row_idx == 0:
            steps_summary[row_idx] = [Paragraph(f"<font color='white'>{cell.text}</font>", body_bold) for cell in steps_summary[row_idx]]
    story.append(steps_table)
    story.append(Spacer(1, 10))

    # Page Break for clean reading
    story.append(PageBreak())

    # ---------------------------------------------------------
    # SECTION 3: MODEL BENCHMARKS & STATISTICAL INTEGRITY
    # ---------------------------------------------------------
    story.append(Paragraph("3. Statistical Integrity & Empirical Benchmarks", h1_style))
    story.append(Paragraph("MedCost.ai trains two production OLS regression models on identical 80k/20k splits to evaluate demographic vs. clinical predictive power:", body_style))
    story.append(Spacer(1, 4))

    # Embed Model Comparison Charts
    story.append(Image(comp_chart_path, width=530, height=161))
    story.append(Spacer(1, 6))

    # Embed Feature Weights Chart
    story.append(Image(coef_chart_path, width=530, height=183))
    story.append(Spacer(1, 6))

    # Benchmark metrics comparison table
    benchmark_data = [
        [
            Paragraph("<b>Metric</b>", body_bold),
            Paragraph("<b>Model A (Demographics Baseline)</b>", body_bold),
            Paragraph("<b>Model B (Clinical Intake Profile)</b>", body_bold),
            Paragraph("<b>Actuarial Interpretation</b>", body_bold)
        ],
        [
            Paragraph("<b>Predictor Count</b>", body_bold),
            Paragraph("6 Covariates (11 Encoded)", body_style),
            Paragraph("12 Covariates (21 Encoded)", body_style),
            Paragraph("Model B adds clinical utilization & history.", body_style)
        ],
        [
            Paragraph("<b>Holdout Test R²</b>", body_bold),
            Paragraph("<b>4.54%</b>", body_style),
            Paragraph("<b>16.90%</b> (+12.36% Boost)", body_bold),
            Paragraph("Demonstrates clinical markers drive medical risk.", body_style)
        ],
        [
            Paragraph("<b>Holdout Test MAE</b>", body_bold),
            Paragraph("$1,934.10 USD", body_style),
            Paragraph("<b>$1,778.62 USD</b> (-$155.48)", body_bold),
            Paragraph("Mean prediction error reduced significantly.", body_style)
        ],
        [
            Paragraph("<b>Base Intercept (β₀)</b>", body_bold),
            Paragraph("$652.65 USD", body_style),
            Paragraph("$48.23 USD", body_style),
            Paragraph("Baseline annual cost before covariate scaling.", body_style)
        ],
        [
            Paragraph("<b>Max VIF (Collinearity)</b>", body_bold),
            Paragraph("2.39 (Region South)", body_style),
            Paragraph("1.46 (Age)", body_style),
            Paragraph("All VIFs < 2.5 (No multicollinearity).", body_style)
        ],
        [
            Paragraph("<b>Target Leakage Status</b>", body_bold),
            Paragraph("0% Post-Claim Variables", body_style),
            Paragraph("0% Post-Claim Variables", body_style),
            Paragraph("Strictly audited pre-policy data only.", body_style)
        ]
    ]
    bench_table = Table(benchmark_data, colWidths=[105, 135, 140, 152])
    bench_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_FOREST),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, CARD_BG]),
        ('BOX', (0, 0), (-1, -1), 0.5, LIGHT_BORDER),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, LIGHT_BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    for row_idx in range(len(benchmark_data)):
        if row_idx == 0:
            benchmark_data[row_idx] = [Paragraph(f"<font color='white'>{cell.text}</font>", body_bold) for cell in benchmark_data[row_idx]]
    story.append(bench_table)
    story.append(Spacer(1, 10))

    # Page Break for Individual Modules
    story.append(PageBreak())

    # ---------------------------------------------------------
    # SECTION 4: INDIVIDUAL VIVA STUDY MODULES
    # ---------------------------------------------------------
    story.append(Paragraph("4. Individual Team Viva Preparation Modules", h1_style))
    story.append(Paragraph("Each team member must master their designated ownership area and be prepared to deliver the model answers below when examined by external professors:", body_style))
    story.append(Spacer(1, 6))

    # Helper function for member Q&A block
    def make_member_block(name, role, domain, math_concept, q1, a1, q2, a2):
        block = []
        block.append(Paragraph(f"<b>{name}</b> — <font color='#2D6A4F'>{role}</font>", h2_style))
        block.append(Paragraph(f"<b>Primary Domain:</b> {domain}", body_style))
        block.append(Paragraph(f"<b>Key Theory & Mathematical Concept:</b> {math_concept}", body_style))
        block.append(Spacer(1, 3))

        qa_data = [
            [
                Paragraph(f"<b>Q1:</b> {q1}", callout_q),
            ],
            [
                Paragraph(f"<b>Model Answer:</b> \"{a1}\"", callout_a),
            ],
            [
                Paragraph(f"<b>Q2:</b> {q2}", callout_q),
            ],
            [
                Paragraph(f"<b>Model Answer:</b> \"{a2}\"", callout_a),
            ]
        ]
        qa_table = Table(qa_data, colWidths=[532])
        qa_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), CALLOUT_BG),
            ('BOX', (0, 0), (-1, -1), 0.5, SECONDARY_FOREST),
            ('LINEBELOW', (0, 1), (-1, 1), 0.5, LIGHT_BORDER),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ]))
        block.append(qa_table)
        block.append(Spacer(1, 6))
        return block

    # 1. Lucky Gupta
    for flowable in make_member_block(
        "Lucky Gupta", "Project Lead & Predictive Modeling",
        "OLS Normal Equation solver, closed-form decomposition, and target leakage prevention.",
        "Normal Equation: β̂ = (XᵀX)⁻¹ Xᵀy. Decomposed inference: ŷ = β₀ + Σ(βⱼ · xⱼ). Ensures exact zero black-box liability.",
        "Why did you choose Linear Regression instead of Random Forest or Gradient Boosting?",
        "In healthcare financing and insurance underwriting, regulatory bodies mandate complete auditability. Black-box models cannot give exact dollar attributions. Linear Regression guarantees exact closed-form marginal decomposition: every dollar estimated is mathematically tied to a specific clinical covariate.",
        "Why is your R² 16.90%? Isn't that low?",
        "In true pre-policy healthcare economics, R² between 15% and 25% is scientifically honest. Costs are heavily skewed by unpredictable emergency events. Online models showing 90%+ R² commit severe data leakage by including post-claim variables like claims_paid or annual_premium. We strictly enforce zero target leakage."
    ):
        story.append(flowable)

    # 2. Ahsan Afaque
    for flowable in make_member_block(
        "Ahsan Afaque", "Healthcare Informatics & Systems Architecture",
        "Python Flask REST API endpoints, ACID SQLite repository, and ReportLab two-pass PDF engine.",
        "Stateless REST routing (/api/predict, /api/simulate, /api/history). Dynamic two-pass pagination using ReportLab NumberedCanvas.",
        "How do you handle database concurrency in SQLite with Flask?",
        "We utilize SQLite's Write-Ahead Logging (WAL) mode and configure dedicated per-request connections managed with context handlers (get_db()). Transactions commit and close immediately, preventing file locking across concurrent requests.",
        "Why compile the PDF on the backend with ReportLab instead of window.print() in React?",
        "Browser window.print() depends on client browser rendering engines, screen resolutions, and CSS print media variations, often causing awkward page breaks. ReportLab v4 generates a vector-precise, certified PDF with dynamic 'Page X of Y' pagination that renders identically everywhere."
    ):
        story.append(flowable)

    story.append(PageBreak())

    # 3. Koushik Badayakar
    for flowable in make_member_block(
        "Koushik Badayakar", "Statistical Analysis & Model Benchmarking",
        "Gauss-Markov BLUE theorem compliance, Variance Inflation Factor (VIF), and residual diagnostics.",
        "Gauss-Markov: OLS is Best Linear Unbiased Estimator. VIF = 1 / (1 - Rⱼ²). All VIFs < 2.5 prove zero problematic multicollinearity.",
        "What is VIF and how did you verify your model has no multicollinearity?",
        "Variance Inflation Factor measures how much the variance of an estimated coefficient increases due to collinearity with other predictors. VIF > 5 or 10 indicates severe multicollinearity. In MedCost.ai, all VIFs are under 2.5 because we used k-1 baseline dummy encoding and verified zero correlation among clinical markers.",
        "Your residuals are right-skewed. Does that violate Gauss-Markov?",
        "No. Gauss-Markov requires spherical errors for β̂ to be BLUE; it does NOT require normality. Normality is only required for small-sample t-tests. With N = 80,000 policyholders, the Central Limit Theorem ensures our parameter estimators are asymptotically normally distributed."
    ):
        story.append(flowable)

    # 4. Kazi Samiul
    for flowable in make_member_block(
        "Kazi Samiul", "Frontend UI/UX & Interaction Engineering",
        "React 19 architecture, 16-step single-question onboarding flow, pitch-black dark mode, Recharts.",
        "One-question-per-step UX, live BMI calculation (kg/m²), 300ms slider debouncing, and UserContext profile synchronization.",
        "How does the interactive onboarding flow hand off data to the Cost Estimator?",
        "We centralized patient profile and clinical data in React UserContext with localStorage persistence. When the user finishes Step 16 and clicks 'Compute My Estimated Cost', the profile payload is passed directly to EstimatorView, automatically populating all 14 form fields and triggering OLS calculation instantly.",
        "How does the What-If Simulator prevent UI freeze during real-time slider manipulation?",
        "We separate local React slider state (which updates fluidly at 60fps) from backend API calls using a custom 300ms debounce timer. Counterfactual predictions are requested only after the user pauses adjustments, eliminating server flooding."
    ):
        story.append(flowable)

    # 5. Koustav Ghosh
    for flowable in make_member_block(
        "Koustav Ghosh", "Econometric Validation & Actuarial Research",
        "Healthcare economics, clinical risk multipliers, smoking marginal surcharges, and demographic pooling.",
        "Marginal weights: Hospitalization (+ $1,928.25), Current Smoker (+ $1,540.40), Chronic Count (+ $926.66), BMI (+ $28.39).",
        "Why is the coefficient for Current Smoker (+$1,540.40) so much higher than BMI (+$28.39)?",
        "Tobacco smoking causes immediate, acute systemic vascular damage and elevated oncology risks, making it an aggressive multiplicative risk driver. BMI operates incrementally across a 20-unit span, so a 10-unit BMI increase adds +$283.90/year, reflecting chronic cumulative strain.",
        "Why is the coefficient for income and deductible near $0.00 in Model B?",
        "In actuarial economics, income and deductible are financial and plan structure choices, not direct physiological causes of medical treatment costs. Once direct clinical markers like hospitalizations, chronic diseases, and blood pressure are controlled for, baseline medical costs are driven by biological health factors rather than household income."
    ):
        story.append(flowable)

    story.append(Spacer(1, 6))

    # ---------------------------------------------------------
    # SECTION 5: LIVE VIVA DEMONSTRATION SCRIPT & CHECKLIST
    # ---------------------------------------------------------
    story.append(Paragraph("5. Recommended 2-Minute Live Viva Demonstration Script", h1_style))
    story.append(Paragraph("When presenting to evaluators, execute this structured 5-step walkthrough:", body_style))
    story.append(Spacer(1, 3))

    demo_steps = [
        [
            Paragraph("<b>Step</b>", body_bold),
            Paragraph("<b>Screen & Action</b>", body_bold),
            Paragraph("<b>Script to Say to the Professor</b>", body_bold)
        ],
        [
            Paragraph("<b>1</b>", code_style),
            Paragraph("<b>Sidebar Navigation</b><br/>Click Left Hamburger Toggle", body_style),
            Paragraph("\"We engineered a sleek left sidebar with dynamic initials monogram (LG), organized into clear navigation groups and pitch-black OLED styling.\"", body_style)
        ],
        [
            Paragraph("<b>2</b>", code_style),
            Paragraph("<b>About Us & R&D Team</b><br/>Select 'About Us'", body_style),
            Paragraph("\"Here is our 5-member research team, our continuous 5-step audit pipeline, and the Gauss-Markov assumptions verification table.\"", body_style)
        ],
        [
            Paragraph("<b>3</b>", code_style),
            Paragraph("<b>Health Intake (Login)</b><br/>Select 'Health Intake & Login'", body_style),
            Paragraph("\"Rather than a crowded static form, we built a 16-step single-question conversational onboarding flow with a live dynamic BMI calculator.\"", body_style)
        ],
        [
            Paragraph("<b>4</b>", code_style),
            Paragraph("<b>Cost Estimator</b><br/>Click 'Compute Estimated Cost'", body_style),
            Paragraph("\"All 14 clinical covariates are handed off automatically. The OLS engine executes instantly, decomposing the $1,122.44 annual charge into exact dollar attributions.\"", body_style)
        ],
        [
            Paragraph("<b>5</b>", code_style),
            Paragraph("<b>Actuarial PDF</b><br/>Click 'Download PDF Report'", body_style),
            Paragraph("\"Finally, ReportLab compiles a two-pass certified actuarial PDF report with dynamic pagination and feature breakdowns on the fly.\"", body_style)
        ]
    ]
    demo_table = Table(demo_steps, colWidths=[35, 145, 352])
    demo_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), SECONDARY_FOREST),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, CARD_BG]),
        ('BOX', (0, 0), (-1, -1), 0.5, LIGHT_BORDER),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, LIGHT_BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    for row_idx in range(len(demo_steps)):
        if row_idx == 0:
            demo_steps[row_idx] = [Paragraph(f"<font color='white'>{cell.text}</font>", body_bold) for cell in demo_steps[row_idx]]
    story.append(demo_table)

    # Build document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully built: {filename}")

if __name__ == '__main__':
    output_pdf_path = 'MedCost_Viva_Master_Preparation_Guide.pdf'
    build_pdf(output_pdf_path)
