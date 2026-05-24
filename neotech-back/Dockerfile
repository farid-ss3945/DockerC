FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /back

COPY *.sln .
COPY Neotech.Domain/*.csproj ./Neotech.Domain/
COPY Neotech.Application/*.csproj ./Neotech.Application/
COPY Neotech.Infrastructure/*.csproj ./Neotech.Infrastructure/
COPY Neotech/*.csproj ./Neotech/

RUN dotnet restore

COPY . .
RUN dotnet publish Neotech/Neotech.csproj -c Release -o out

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /back
COPY --from=build /back/out .
CMD ["dotnet", "Neotech.dll"]