FROM python:3.9

WORKDIR /app

RUN git clone https://github.com/scurest/apicula.git
# Install Rust using curl
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

ENV PATH="/root/.cargo/bin:${PATH}"

RUN git clone https://github.com/rust-lang/regex.git

# Navigate to the regex repository directory
WORKDIR /app/regex

# Run cargo build to build the project
RUN cargo build

# Navigate to the apcicula repository directory
WORKDIR /app/apicula

RUN cargo b --release

RUN target/release/apicula -V

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["python", "app.py"]