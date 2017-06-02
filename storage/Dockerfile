FROM ruby:2.2

RUN mkdir -p /app
WORKDIR /app

COPY Gemfile* ./
RUN bundler install

COPY . .

VOLUME /app/db
EXPOSE 3000
CMD thin start --debug -l /dev/stderr -R ./thin.ru
