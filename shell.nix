let
  nixpkgs = fetchTarball "https://github.com/NixOS/nixpkgs/tarball/4eb33fe664af7b41a4c446f87d20c9a0a6321fa3"; # release-24.05
  pkgs = import nixpkgs { config = {}; overlays = []; };
in

pkgs.mkShellNoCC {
  # packages
  packages = with pkgs; [
    nodePackages.npm
    nodejs
    git
    curl
  ];

  # environment variables
  ROOT_PATH = toString ./.;
  FRONT_PATH = toString ./junqo_front;
  BACK_PATH = toString ./junqo_back;

  # load on shell start
  shellHook = ''
    echo "Installing back-end dependencies..."
    (cd $BACK_PATH && npm ci)

    echo "Installing front-end dependencies..."
    (cd $FRONT_PATH && npm ci)

    echo "Setting up project-specific NestJS CLI..."
    (cd $BACK_PATH && npm install --save-dev @nestjs/cli)

    echo -e "\033[0;32mNix development environment setup complete! \033[0m"
'';
}
