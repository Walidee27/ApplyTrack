# Étape 1 : compilation avec Maven
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -B -q dependency:go-offline
COPY src ./src
RUN mvn -B -q package -DskipTests

# Étape 2 : image d'exécution légère, sans les outils de build
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app

# Tas limité à 60 % des 512 Mo de Render : le reste couvre l'archive CDS, le métaspace et les threads.
# Compilation JIT limitée au niveau 1 : démarrage bien plus rapide quand le processeur est très limité.
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=60 -XX:+UseSerialGC -XX:TieredStopAtLevel=1"

# Le jar « extrait » (jar principal + dossier lib/) est le format attendu par CDS
COPY --from=build /app/target/*.jar app.jar
RUN java -Djarmode=tools -jar app.jar extract --destination extracted && rm app.jar

# Archive CDS (Class Data Sharing) : on démarre l'application une fois pendant le build pour
# enregistrer les classes chargées, puis la JVM les relit directement à chaque démarrage.
# spring.context.exit=onRefresh arrête l'application juste après l'initialisation du contexte ;
# les options suivantes évitent tout accès à la base, indisponible pendant le build.
RUN java -XX:ArchiveClassesAtExit=extracted/app.jsa \
        -Dspring.context.exit=onRefresh \
        -Dspring.flyway.enabled=false \
        -Dspring.jpa.hibernate.ddl-auto=none \
        -Dspring.jpa.properties.hibernate.boot.allow_jdbc_metadata_access=false \
        -Dspring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect \
        -Dapp.reminders.enabled=false \
        -Dapp.demo.enabled=false \
        -jar extracted/app.jar \
    && chown -R app:app extracted

USER app
EXPOSE 8080
ENTRYPOINT ["java", "-XX:SharedArchiveFile=extracted/app.jsa", "-jar", "extracted/app.jar"]
