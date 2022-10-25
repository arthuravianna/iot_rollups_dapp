# syntax=docker.io/docker/dockerfile:1.4
#FROM cartesi/toolchain:0.11.0 as dapp-build

FROM toolchain-python

WORKDIR /opt/cartesi/dapp
COPY . .

RUN <<EOF
python3 -m crossenv /mnt/python-dapp/bin/python3 .venv
. .venv/bin/activate
pip install -r back_end/requirements.txt
EOF
