"""
Mock LLM service for development/testing without API keys
Provides realistic responses for qualitative research analysis
"""

import random
from typing import Dict, List, Tuple


def code_themes(transcript: str) -> Tuple[Dict, Tuple[int, int]]:
    """
    Mock theme extraction from transcript
    Returns themes in Indonesian context
    """
    # Simulate different themes based on transcript length
    transcript_length = len(transcript)

    # Common themes for Indonesian qualitative research
    theme_pool = [
        {
            "id": 1,
            "name": "Sensitivitas Harga",
            "description": "Responden menunjukkan kepedulian tinggi terhadap harga dan value for money",
            "prevalence": "Tinggi",
            "sentiment": "Negatif"
        },
        {
            "id": 2,
            "name": "Pengalaman Pengguna",
            "description": "Kemudahan penggunaan dan interface menjadi faktor penting",
            "prevalence": "Sedang",
            "sentiment": "Positif"
        },
        {
            "id": 3,
            "name": "Kepercayaan Brand",
            "description": "Trust dan reputasi brand mempengaruhi keputusan pembelian",
            "prevalence": "Tinggi",
            "sentiment": "Campuran"
        },
        {
            "id": 4,
            "name": "Pengaruh Sosial",
            "description": "Rekomendasi dari keluarga dan teman sangat berpengaruh",
            "prevalence": "Sedang",
            "sentiment": "Positif"
        },
        {
            "id": 5,
            "name": "Kualitas Produk",
            "description": "Durabilitas dan kualitas menjadi pertimbangan utama",
            "prevalence": "Tinggi",
            "sentiment": "Netral"
        },
        {
            "id": 6,
            "name": "Layanan Pelanggan",
            "description": "Responsivitas dan kualitas customer service sangat penting",
            "prevalence": "Sedang",
            "sentiment": "Campuran"
        },
        {
            "id": 7,
            "name": "Inovasi Fitur",
            "description": "Ketertarikan pada fitur-fitur baru dan teknologi terkini",
            "prevalence": "Rendah",
            "sentiment": "Positif"
        },
        {
            "id": 8,
            "name": "Aksesibilitas",
            "description": "Kemudahan akses dan ketersediaan produk di berbagai channel",
            "prevalence": "Tinggi",
            "sentiment": "Netral"
        }
    ]

    # Select 3-5 themes randomly
    num_themes = random.randint(3, 5)
    selected_themes = random.sample(theme_pool, num_themes)

    # Renumber themes
    for i, theme in enumerate(selected_themes):
        theme["id"] = i + 1

    # Estimate respondent count based on transcript
    respondent_count = max(3, min(12, transcript_length // 500))

    result = {
        "respondentCount": respondent_count,
        "themes": selected_themes
    }

    # Mock token usage (input, output)
    input_tokens = len(transcript) // 4
    output_tokens = 150 + (num_themes * 50)

    return result, (input_tokens, output_tokens)


def extract_verbatims(transcript: str, themes: List[Dict]) -> Tuple[Dict, Tuple[int, int]]:
    """
    Mock verbatim extraction for themes
    Returns quotes in Indonesian/mixed language
    """

    # Sample verbatims for different theme types
    verbatim_templates = {
        "Sensitivitas Harga": [
            "Harganya terlalu mahal untuk fitur yang ditawarkan, mending beli yang lain",
            "Kalau ada promo atau diskon baru saya consider untuk beli",
            "Saya selalu compare price dulu sebelum beli, cari yang paling worth it",
            "Untuk harga segitu, ekspektasi saya lebih tinggi"
        ],
        "Pengalaman Pengguna": [
            "Aplikasinya user-friendly banget, gampang dipahami",
            "Interface-nya clean dan modern, saya suka",
            "Agak ribet sih navigasinya, harus klik sana-sini",
            "Loading-nya cepat, ga pake lama"
        ],
        "Kepercayaan Brand": [
            "Brand ini sudah terkenal dan trusted, jadi saya percaya",
            "Saya dengar banyak komplain tentang brand ini",
            "Sudah pakai bertahun-tahun, never disappointed",
            "Brand lokal tapi kualitasnya ga kalah sama yang import"
        ],
        "Pengaruh Sosial": [
            "Teman-teman saya pada pakai ini, jadi saya ikutan",
            "Di social media banyak yang review bagus",
            "Keluarga saya recommend brand ini",
            "Influencer yang saya follow pada pakai semua"
        ],
        "Kualitas Produk": [
            "Build quality-nya solid, berasa premium",
            "Sudah 2 tahun pakai masih awet",
            "Material-nya berasa murahan, mudah rusak",
            "Kualitasnya sesuai dengan harganya lah"
        ],
        "Layanan Pelanggan": [
            "CS-nya fast response dan helpful",
            "Komplain saya ditangani dengan baik",
            "Susah banget contact customer service-nya",
            "After sales service-nya memuaskan"
        ],
        "Inovasi Fitur": [
            "Fitur AI-nya keren banget, membantu sekali",
            "Ada fitur baru yang belum ada di kompetitor",
            "Teknologinya cutting-edge, very impressive",
            "Fiturnya biasa aja, nothing special"
        ],
        "Aksesibilitas": [
            "Gampang dicari di mana-mana, ada di semua toko",
            "Online dan offline都有, very convenient",
            "Stock sering kosong, susah dicari",
            "Bisa beli di marketplace, praktis banget"
        ]
    }

    # Fallback verbatims if theme not in templates
    fallback_verbatims = [
        "Menurut saya ini penting untuk dipertimbangkan",
        "Pengalaman saya selama ini cukup memuaskan",
        "Ada plus minus-nya sih, tergantung kebutuhan",
        "Overall saya puas dengan experience-nya"
    ]

    verbatims = []
    speaker_names = ["Responden A", "Responden B", "Responden C", "Responden D",
                     "Responden E", "Responden F", "Participant 1", "Participant 2"]

    for theme in themes:
        theme_name = theme.get("name", "")
        theme_id = theme.get("id", 1)

        # Get relevant quotes for this theme
        if theme_name in verbatim_templates:
            quotes = verbatim_templates[theme_name]
        else:
            quotes = fallback_verbatims

        # Select 2-3 quotes per theme
        num_quotes = random.randint(2, 3)
        selected_quotes = random.sample(quotes, min(num_quotes, len(quotes)))

        for quote in selected_quotes:
            verbatims.append({
                "themeId": theme_id,
                "quote": quote,
                "speaker": random.choice(speaker_names)
            })

    result = {
        "verbatims": verbatims
    }

    # Mock token usage
    input_tokens = len(str(transcript)) // 4 + len(str(themes)) // 4
    output_tokens = 200 + (len(verbatims) * 30)

    return result, (input_tokens, output_tokens)


def generate_topline(themes: List[Dict], verbatims: List[Dict]) -> Tuple[Dict, Tuple[int, int]]:
    """
    Mock topline/executive summary generation
    Returns summary in Indonesian business context
    """

    # Create a topline based on the themes
    theme_names = [t.get("name", "") for t in themes if isinstance(t, dict)]

    if not theme_names:
        theme_names = ["Kualitas Produk", "Harga", "Layanan"]

    topline_templates = [
        f"""RINGKASAN EKSEKUTIF

Berdasarkan analisis mendalam terhadap transkrip FGD/IDI, teridentifikasi {len(theme_names)} tema utama yang krusial untuk strategi brand:

1. **{theme_names[0] if len(theme_names) > 0 else 'Tema Utama'}**: Menjadi concern terbesar responden dengan sentimen yang bervariasi. Diperlukan attention khusus untuk address isu ini.

2. **{theme_names[1] if len(theme_names) > 1 else 'Tema Sekunder'}**: Faktor penting dalam decision-making process konsumen. Opportunity untuk diferensiasi dari kompetitor.

3. **{theme_names[2] if len(theme_names) > 2 else 'Tema Pendukung'}**: Meskipun bukan prioritas utama, tetap perlu dipertimbangkan dalam overall strategy.

REKOMENDASI STRATEGIS:
• Fokus immediate pada improvement area yang high-impact
• Leverage strength yang sudah ada untuk build competitive advantage
• Develop action plan yang measurable dan time-bound

KEY TAKEAWAY:
Konsumen Indonesia menunjukkan pola yang konsisten dalam preferensi mereka, dengan emphasis pada value for money dan trust. Brand positioning harus align dengan insights ini untuk achieve market success.""",

        f"""EXECUTIVE SUMMARY

Riset kualitatif ini mengungkap {len(theme_names)} insight kunci tentang consumer behavior dan brand perception:

TOP INSIGHTS:
→ {theme_names[0] if len(theme_names) > 0 else 'Insight 1'}: Critical factor yang drive purchase decision
→ {theme_names[1] if len(theme_names) > 1 else 'Insight 2'}: Area untuk potential improvement
→ {theme_names[2] if len(theme_names) > 2 else 'Insight 3'}: Opportunity untuk market differentiation

CONSUMER SENTIMENT:
Secara umum, responden menunjukkan mixed sentiment dengan kecenderungan positif pada aspek tertentu namun masih ada concern pada area lainnya. Trust dan value perception menjadi key drivers.

STRATEGIC IMPLICATIONS:
1. Prioritize customer pain points untuk quick wins
2. Invest dalam long-term brand building initiatives
3. Optimize marketing communication untuk address consumer concerns

NEXT STEPS:
Recommend untuk conduct quantitative validation dan develop detailed implementation roadmap berdasarkan prioritas yang teridentifikasi."""
    ]

    # Select a template
    topline = random.choice(topline_templates)

    result = {
        "topline": topline
    }

    # Mock token usage
    input_tokens = sum(len(str(t)) for t in themes) // 4 + len(str(verbatims)) // 4
    output_tokens = len(topline) // 4

    return result, (input_tokens, output_tokens)


def write_topline(transcript: str, themes: List[Dict]) -> Tuple[Dict, Tuple[int, int]]:
    """
    Mock topline/executive summary generation matching real LLM interface
    Takes transcript and themes, returns topline and implications
    """
    # Generate business implications based on themes
    implications_by_theme = {
        "Price Sensitivity": [
            "Develop tiered pricing strategy to cater to different market segments",
            "Introduce value packs or bundling options to improve perceived value",
            "Communicate product benefits clearly to justify premium pricing"
        ],
        "User Experience": [
            "Invest in UX/UI improvements based on user feedback",
            "Implement user onboarding program to reduce friction",
            "Create feedback loops for continuous experience optimization"
        ],
        "Brand Trust": [
            "Build trust through transparency and consistent communication",
            "Leverage local partnerships to enhance credibility",
            "Implement customer testimonials and social proof strategies"
        ],
        "Product Quality": [
            "Maintain strict quality control standards across all touchpoints",
            "Develop quality assurance communication strategy",
            "Create product education content to highlight quality features"
        ],
        "Customer Service": [
            "Invest in customer service training and resources",
            "Implement omnichannel support strategy",
            "Create self-service resources to reduce support burden"
        ]
    }

    # Build topline based on themes
    theme_names = [t.get("name", "Unknown") for t in themes]
    theme_count = len(themes)

    # Create contextual topline
    if "Price Sensitivity" in str(theme_names):
        topline = f"Research reveals {theme_count} critical themes shaping consumer behavior in the Indonesian market, with price sensitivity emerging as the dominant factor. Consumers demonstrate sophisticated value assessment, balancing quality expectations with budget constraints. The findings indicate strong opportunities for brands that can effectively communicate value propositions while maintaining competitive pricing strategies."
    elif "User Experience" in str(theme_names):
        topline = f"Analysis identifies {theme_count} key themes, with user experience as the primary driver of satisfaction and loyalty. Respondents consistently emphasize the importance of intuitive, seamless interactions across all touchpoints. The research suggests significant competitive advantages for brands that prioritize user-centric design and continuous experience optimization."
    else:
        topline = f"The research uncovers {theme_count} interconnected themes that collectively shape consumer perceptions and behaviors in this market. Respondents demonstrate evolving expectations influenced by both local cultural factors and global trends. These insights provide clear direction for strategic initiatives that can drive market share growth and brand loyalty."

    # Select implications based on identified themes
    implications = []
    for theme in themes[:3]:  # Take top 3 themes
        theme_name = theme.get("name", "")
        # Find matching implications
        for key in implications_by_theme:
            if key.lower() in theme_name.lower():
                implications.extend(implications_by_theme[key][:1])  # Take 1 implication per theme
                break

    # Ensure we have at least 3 implications
    if len(implications) < 3:
        default_implications = [
            "Conduct follow-up quantitative research to validate findings at scale",
            "Develop targeted strategies for each identified consumer segment",
            "Create implementation roadmap with clear KPIs and success metrics"
        ]
        implications.extend(default_implications[:3-len(implications)])

    result = {
        "topline": topline,
        "implications": implications[:3]  # Ensure exactly 3 implications
    }

    # Mock token usage
    input_tokens = len(transcript) // 4 + sum(len(str(t)) for t in themes) // 4
    output_tokens = len(topline) // 4 + sum(len(i) for i in implications) // 4

    return result, (input_tokens, output_tokens)