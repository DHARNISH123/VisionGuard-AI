import os
import csv
from io import BytesIO
from datetime import datetime
from typing import List

# Reportlab imports
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

class ReportGenerator:
    @staticmethod
    def generate_incidents_csv(incidents: List[dict]) -> BytesIO:
        """
        Generates a CSV file containing incident reports.
        """
        output = BytesIO()
        # Text wrapper for BytesIO
        wrapper = csv.writer(
            # We need to write string lines and convert them to bytes
            # reportlab/pandas/csv utility
        )
        
        # We can construct the CSV string directly
        csv_data = []
        csv_data.append(["Incident ID", "Worksite Location", "Camera Name", "Timestamp (UTC)", "Missing PPE Gear", "Severity", "Resolution Status"])
        
        for inc in incidents:
            csv_data.append([
                inc.get("id"),
                inc.get("location"),
                inc.get("camera_name"),
                inc.get("timestamp"),
                ", ".join(inc.get("ppe_violation_types", [])),
                inc.get("severity"),
                inc.get("status")
            ])
            
        csv_string = ""
        for row in csv_data:
            csv_string += ",".join([f'"{str(val)}"' for val in row]) + "\n"
            
        output.write(csv_string.encode('utf-8'))
        output.seek(0)
        return output

    @staticmethod
    def generate_incidents_pdf(incidents: List[dict], stats: dict) -> BytesIO:
        """
        Generates a premium PDF safety compliance audit document.
        """
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )
        
        styles = getSampleStyleSheet()
        
        # Custom styles for a clean premium SaaS appearance
        title_style = ParagraphStyle(
            name='TitleStyle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=24,
            textColor=colors.HexColor('#0F172A'), # Slate 900
            spaceAfter=6
        )
        
        subtitle_style = ParagraphStyle(
            name='SubtitleStyle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            textColor=colors.HexColor('#64748B'), # Slate 500
            spaceAfter=20
        )
        
        h2_style = ParagraphStyle(
            name='H2Style',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=14,
            textColor=colors.HexColor('#1E293B'), # Slate 800
            spaceBefore=12,
            spaceAfter=8
        )
        
        body_style = ParagraphStyle(
            name='BodyStyle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            textColor=colors.HexColor('#334155'), # Slate 700
            spaceAfter=6
        )

        table_header_style = ParagraphStyle(
            name='TableHeader',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=9,
            textColor=colors.white
        )

        table_body_style = ParagraphStyle(
            name='TableBody',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=8,
            textColor=colors.HexColor('#334155')
        )

        elements = []
        
        # Title and Header
        elements.append(Paragraph("VisionGuard AI — Safety Audit Report", title_style))
        elements.append(Paragraph(f"Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} | Confidential Worksite Metrics", subtitle_style))
        elements.append(Spacer(1, 10))
        
        # Stats summary block (using a Table layout)
        elements.append(Paragraph("Platform Executive Summary", h2_style))
        summary_data = [
            [
                Paragraph("<b>Total Active Cameras</b>", body_style),
                Paragraph("<b>Logged Violations</b>", body_style),
                Paragraph("<b>Compliance Rating</b>", body_style),
                Paragraph("<b>Pending Reviews</b>", body_style)
            ],
            [
                Paragraph(str(stats.get("total_cameras", 0)), h2_style),
                Paragraph(str(stats.get("total_incidents", 0)), h2_style),
                Paragraph(f"{stats.get('compliance_rate', 100)}%", h2_style),
                Paragraph(str(stats.get("pending_incidents", 0)), h2_style)
            ]
        ]
        
        summary_table = Table(summary_data, colWidths=[1.8*inch, 1.8*inch, 1.8*inch, 1.8*inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')), # Slate 50
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#0F172A')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
            ('TOPPADDING', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ]))
        elements.append(summary_table)
        elements.append(Spacer(1, 20))
        
        # Incidents table
        elements.append(Paragraph("Detailed Safety Incident Log", h2_style))
        
        # Table columns: ID, Timestamp, Worksite, Camera, Violation, Severity, Status
        table_data = [[
            Paragraph("ID", table_header_style),
            Paragraph("Timestamp", table_header_style),
            Paragraph("Location", table_header_style),
            Paragraph("Camera", table_header_style),
            Paragraph("PPE Violation Types", table_header_style),
            Paragraph("Severity", table_header_style),
            Paragraph("Status", table_header_style)
        ]]
        
        for inc in incidents:
            table_data.append([
                Paragraph(str(inc.get("id")), table_body_style),
                Paragraph(inc.get("timestamp"), table_body_style),
                Paragraph(inc.get("location"), table_body_style),
                Paragraph(inc.get("camera_name"), table_body_style),
                Paragraph(", ".join(inc.get("ppe_violation_types", [])), table_body_style),
                Paragraph(inc.get("severity"), table_body_style),
                Paragraph(inc.get("status"), table_body_style)
            ])
            
        col_widths = [0.4*inch, 1.3*inch, 1.2*inch, 1.1*inch, 1.8*inch, 0.7*inch, 0.8*inch]
        incidents_table = Table(table_data, colWidths=col_widths, repeatRows=1)
        
        # Premium styling for the incidents table
        incidents_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E293B')), # Slate 800
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')]),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        
        elements.append(incidents_table)
        
        # Build Document
        doc.build(elements)
        buffer.seek(0)
        return buffer
