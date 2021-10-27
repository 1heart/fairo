# Copyright (c) Facebook, Inc. and its affiliates.

# This script creates a tar and hash of the datasets directory.
# If uploading files to S3 through console UI, go to the web interface at: 
# https://s3.console.aws.amazon.com/s3/buckets/craftassist?region=us-west-2&prefix=pubr/&showversions=false 
# and upload ``datasets_folder_<sha1sum>.tar.gz``.

import os
import subprocess

ROOTDIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../')
print("Rootdir : %r" % ROOTDIR)

def checksum_tar_and_upload(agent, artifact_name, model_name=None):
    if not agent:
        agent = "craftassist"
        print("Agent name not specified, defaulting to craftassist")

    agent_path = os.path.join(ROOTDIR, 'agents/' + agent)
    print("Agent path: %r" % (agent_path))

    checksum_name = 'checksum.txt'
    if artifact_name == "models":
        if not model_name:
            model_name = "nlu"
            print("Model type not specified, defaulting to NLU model.")
        checksum_name = model_name + '_checksum.txt'

    artifact_path = os.path.join(agent_path, artifact_name)
    # TODO: Double check for locobot
    checksum_path = os.path.join(artifact_path, checksum_name)
    compute_shasum_script_path = os.path.join(ROOTDIR, 'tools/data_scripts/checksum_fn.sh')
    result = subprocess.check_output([compute_shasum_script_path, artifact_path, checksum_path],
                                     text=True)
    print(result)
    with open(checksum_path) as f:
        checksum = f.read().strip()
    print("CHECKSUM: %r" % (checksum))

    # tar the folder
    if model_name:
        artifact_name = artifact_name + '_' + model_name
    print("Now making the tar file...")
    # TODO: check if we need the model name here
    process = subprocess.Popen(['tar', '-czvf',
                                agent + '_' + artifact_name + '_folder_' + checksum + '.tar.gz',
                                '--exclude="*/\.*"', '--exclude="*checksum*"', artifact_path],
                               stdout=subprocess.PIPE,
                               stderr=subprocess.PIPE
                               )
    stdout, stderr = process.communicate()
    print(stdout.decode("utf-8"))
    print(stderr.decode("utf-8"))
    print("Now uploading ...")
    process = subprocess.Popen(['aws', 's3', 'cp',
                                agent + '_' + artifact_name + '_folder_' + checksum + '.tar.gz', 's3://craftassist/pubr/'],
                               stdout=subprocess.PIPE,
                               universal_newlines=True)
    stdout, stderr = process.communicate()
    print(stdout.decode("utf-8"))
    print(stderr.decode("utf-8"))


def upload_agent_datasets(agent=None):
    checksum_tar_and_upload(agent=agent, artifact_name="datasets")


def upload_agent_models(agent=None, model_name=None):
    checksum_tar_and_upload(agent=agent, artifact_name="models", model_name=model_name)

