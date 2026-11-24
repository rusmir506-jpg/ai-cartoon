FROM python:3.13-slim
RUN useradd --uid 10001 --no-create-home --shell /usr/sbin/nologin app
WORKDIR /app
COPY server.py export_subscribers.py config.json ./
COPY public ./public
ENV HOST=0.0.0.0 PORT=8080 DATA_DIR=/data TRUST_PROXY=1 PYTHONDONTWRITEBYTECODE=1
USER 10001
EXPOSE 8080
CMD ["python3", "server.py"]
