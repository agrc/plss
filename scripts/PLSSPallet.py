#!/usr/bin/env python
# * coding: utf8 *
'''
PLSSPallet.py

A module that contains the pallet to update the mapserv.utah.gov/plss web app
'''

from forklift.models import Pallet
from os.path import join


class PlssPallet(Pallet):

    def __init__(self):
        super(PlssPallet, self).__init__()

        self.arcgis_services = [('PLSS', 'MapServer')]
        self.boundaries = 'C:\\Scheduled\\Staging\\Boundaries_UTM.gdb'
        self.cadastre = 'C:\\Scheduled\\Staging\\Cadastre_UTM.gdb'

        self.copy_data = [self.boundaries, self.cadastre]
        self.destination_coordinate_system = 26912

    def build(self, configuration=None):
        self.add_crates(['PLSSPoint_AGRC'], {'source_workspace': join(self.garage, 'SGID10.sde'),
                                             'destination_workspace': self.cadastre})

        self.add_crates(['Counties'], {'source_workspace': join(self.garage, 'SGID10.sde'),
                                       'destination_workspace': self.boundaries})


class PlssCachePallet(Pallet):

    def __init__(self):
        super(PlssPallet, self).__init__()

        self.arcgis_services = [('UtahPLSS', 'MapServer')]
        self.destination_workspace = 'C:\\Scheduled\\Staging\\Cadastre_UTM.gdb'
        self.copy_data = [self.destination_workspace]
        self.destination_coordinate_system = 26912

    def build(self, configuration=None):
        self.add_crates(
            ['PLSSTownships_GCDB', 'PLSSSections_GCDB', 'PLSSQuarterSections_GCDB', 'PLSSQuarterQuarterSections_GCDB'],
            {'source_workspace': join(self.garage, 'SGID10.sde'),
             'destination_workspace': self.destination_workspace})
