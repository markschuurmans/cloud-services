.PHONY: dev prod down logs clean

dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

prod:
	docker compose up --build -d

down:
	docker compose down

logs:
	docker compose logs -f

clean:
	docker compose down -v --remove-orphans