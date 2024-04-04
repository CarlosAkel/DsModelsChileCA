# DockerExample

This repository provides a simple example of how to build and run a Docker container for the `ds_package` project. Follow the steps below to get started:

1. **Build the Docker Image:**
    ```bash
    docker build . -t ds_package
    ```

2. **Run the Docker Container:**
    ```bash
    docker run -p 5000:5000 ds_package
    ```

3. **Clear All Docker Environment:**
    If you need to clean up unused Docker resources, you can run:
    ```bash
    docker system prune
    ```

## Project Overview

The `ds_package` project focuses on extracting NDS (Nintendo DS) assets. Additionally, it leverages the capabilities of [apicula](https://github.com/scurest/apicula) to visualize these assets. This implementation aims to be straightforward and useful.

Feel free to explore the code and adapt it to your specific needs. If you encounter any issues or have questions, refer to the [apicula repository](https://github.com/scurest/apicula) for further details.
