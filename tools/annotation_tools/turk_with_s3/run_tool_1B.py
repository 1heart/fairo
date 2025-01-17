import subprocess
import time
import sys

"""
Kicks off a pipeline that schedules Turk jobs for tool 1B,
collects results in batches and collates data.

1. Read in newline separated commands and construct CSV input.
2. Create HITs for each input command using tool 1B template.
3. Continuously check for completed assignments, fetching results in batches.
4. Collate turk output data with the input job specs.
5. Postprocess datasets to obtain well formed action dictionaries.
"""

dev_flag = ""
# Parse flags passed into script run
if len(sys.argv) > 1:
    # flag to toggle dev mode is --dev
    dev_flag = sys.argv[1]

# CSV input
rc = subprocess.call(
    [
        "python3 construct_input_for_turk.py --input_file B/input.txt --tool_num 2 > B/turk_input.csv"
    ],
    shell=True,
)
if rc != 0:
    print("Error preprocessing. Exiting.")
    sys.exit()

# Load input commands and create a separate HIT for each row
rc = subprocess.call(
    [
        "python3 create_jobs.py --xml_file fetch_question_B.xml --tool_num 2 --input_csv B/turk_input.csv --job_spec_csv B/turk_job_specs.csv {}".format(dev_flag)
    ],
    shell=True,
)
if rc != 0:
    print("Error creating HIT jobs. Exiting.")
    sys.exit()
# Wait for results to be ready
print("Turk jobs created for tool B at : %s \n Waiting for results..." % time.ctime())
print("*"*50)

time.sleep(200)
# Check if results are ready
rc = subprocess.call(
    [
        "python3 get_results.py --output_csv B/turk_output.csv {}".format(dev_flag)
    ],
    shell=True,
)
if rc != 0:
    print("Error fetching HIT results. Exiting.")
    sys.exit()

# Collate datasets
print("*"*50)
print("*** Collating turk outputs and input job specs ***")
rc = subprocess.call(["python3 collate_answers.py --turk_output_csv B/turk_output.csv --job_spec_csv B/turk_job_specs.csv --collate_output_csv B/processed_outputs.csv"], shell=True)
if rc != 0:
    print("Error collating answers. Exiting.")
    sys.exit()


# Postprocess
print("*"*50)
print("*** Postprocessing results ***")
rc = subprocess.call(["python3 parse_tool_B_outputs.py"], shell=True)
if rc != 0:
    print("Error postprocessing tool B. Exiting.")
    sys.exit()
print("*"*50)