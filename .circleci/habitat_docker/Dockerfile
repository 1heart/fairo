# syntax = docker/dockerfile:experimental
FROM nvidia/cudagl:11.1-base-ubuntu20.04 as base

RUN export DEBIAN_FRONTEND=noninteractive; \
    export DEBCONF_NONINTERACTIVE_SEEN=true; \
    echo 'tzdata tzdata/Areas select Etc' | debconf-set-selections; \
    echo 'tzdata tzdata/Zones/Etc select UTC' | debconf-set-selections; \
    apt-get update -qqy \
    && apt-get install -qqy --no-install-recommends \
       tzdata \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN apt update && apt install -y psmisc curl lsb-release sudo libopengl0 wget unzip g++ gcc cmake curl git make

SHELL ["/bin/bash", "-c"]

RUN mkdir habitat-test-scenes && \
    cd habitat-test-scenes && \
    wget http://dl.fbaipublicfiles.com/habitat/habitat-test-scenes.zip && \
    unzip habitat-test-scenes.zip && \
    rm habitat-test-scenes.zip

# this was locally put in the directory creating the docker image with select environments from
# the replica dataset: https://github.com/facebookresearch/Replica-Dataset/blob/master/download.sh
ADD ./Replica-Dataset /Replica-Dataset

RUN rm -rf /var/lib/apt/lists/*

ENV PATH="/root/miniconda3/bin:${PATH}"
ARG PATH="/root/miniconda3/bin:${PATH}"

RUN wget \
    https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh \
    && mkdir /root/.conda \
    && bash Miniconda3-latest-Linux-x86_64.sh -b \
    && rm -f Miniconda3-latest-Linux-x86_64.sh 
RUN conda --version
SHELL ["/bin/bash", "-c"]

# Environment 
ENV GIT_SSH_COMMAND "ssh -i /mcdeploy.key -o StrictHostKeyChecking=no"

ADD ./conda.txt /conda.txt
ADD ./requirements.txt /pip.txt

RUN conda install mamba -y -c conda-forge

RUN mamba create -n droidlet_env python=3.7 \
    --file /conda.txt -c pytorch -c aihabitat -c open3d-admin -c conda-forge -y

RUN conda init bash && \
    source ~/.bashrc && \
    source activate /root/miniconda3/envs/droidlet_env && \    
    pip install -r /pip.txt

RUN conda create -n habitat_env python=3.7 \
    habitat-sim headless -c aihabitat -c conda-forge -y

RUN source ~/miniconda3/etc/profile.d/conda.sh && conda activate habitat_env && \
    conda install Pyro4 opencv scikit-fmm scikit-image scipy numpy matplotlib pyyaml -c conda-forge

RUN source ~/miniconda3/etc/profile.d/conda.sh && conda activate habitat_env && \
    pip install yacs