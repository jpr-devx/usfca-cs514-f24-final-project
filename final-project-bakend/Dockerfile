# Use Maven to build the application
FROM maven:3-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Use OpenJDK for the runtime image
FROM eclipse-temurin:21-jdk
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
ENV PORT=8080
EXPOSE ${PORT}
ENTRYPOINT ["java", "-Dserver.port=${PORT}", "-jar", "app.jar"]

## Use Maven to build the application
#FROM maven:3-eclipse-temurin-21 AS build
#WORKDIR /app
#COPY pom.xml .
#COPY src ./src
#RUN mvn clean package -DskipTests
#
## Use OpenJDK for the runtime image
#FROM eclipse-temurin:21-jdk
#WORKDIR /app
#COPY --from=build /app/target/*.jar app.jar
#ENV PORT=8080
#EXPOSE ${PORT}
#CMD ["java", "-jar", "app.jar"]