let
  nixpkgs = fetchTarball "https://github.com/NixOS/nixpkgs/tarball/nixos-24.05";
  pkgs = import nixpkgs { config = {}; overlays = []; };
in

pkgs.mkShellNoCC {
  # packages
  packages = with pkgs; [
    nodePackages.npm
  ];

  # environment variables
  # ROOT_PATH = ./.;
  # FRONT_PATH = ./junqo_front;
  # BACK_PATH = ./junqo_back;

  # load on shell start
  shellHook = ''
    export ROOT_PATH=$PWD;
    export FRONT_PATH="$PWD/junqo_front";
    export BACK_PATH="$PWD/junqo_back";

    # Install back dependencies
    cd $BACK_PATH;
    npm install;
    cd $ROOT_PATH;

    # Install global dependencies
    npm i -g @nestjs/cli
'';
}
