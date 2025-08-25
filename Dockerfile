FROM elasticsearch:8.11.0

# Nori 한글 형태소 분석기 플러그인 설치
RUN bin/elasticsearch-plugin install analysis-nori